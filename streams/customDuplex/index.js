// A duplex stream has a readable internal buffer and a writable internal buffer
// They are totally separate from each other. 
const { Duplex } = require("node:stream");
const fs = require("node:fs");

class DuplexStream extends Duplex {
    constructor({ writableHighWaterMark, readableHighWaterMark, readFilename, writeFilename }) {
        super({ writableHighWaterMark, readableHighWaterMark })

        this.readFilename = readFilename;
        this.writeFilename = writeFilename;
        this.readFd = -1;
        this.writeFd = -1;
        this.chunks = [];
        this.chunkSize = -1;
        this.writesCount = -1;
    }

    _construct(callback) {
        fs.open(this.readFilename, "r", (err, readFD) => {
            if (err) return callback(err)

            this.readFd = readFD;
            fs.open(this.writeFilename, "w", (err, writeFD) => {
                if (err) return callback(err)

                this.writeFd = writeFD;
                callback()
            })
        })
    }

    _write(chunk, encoding, callback) {
        // do our write operation
        this.chunks.push(chunk);
        this.chunkSize += chunk.length;


        if (this.chunkSize > this.writableHighWaterMark) {
            fs.write(this.writeFd, Buffer.concat(this.chunks), (err) => {
                if (err) {
                    return callback(err)
                }

                this.chunks = [];
                this.chunkSize = 0;
                ++this.writesCount;
                callback();
            })
        } else {
            // when were done, we should call the callback function.
            callback();
        }
    }

    _read(size) {
        const data = Buffer.alloc(size)
        fs.read(this.readFd, data, 0, size, null, (err, bytesRead) => {
            if (err) return this.destroy(err);

            // Null being passed here is to indicate the end of the stream.
            this.push(bytesRead > 0 ? data.subarray(0, bytesRead) : null);
        })
    }

    _final(callback) {
        fs.write(this.writeFd, Buffer.concat(this.chunks), (err) => {
            if (err) {
                return callback(err)
            } else {
                this.chunks = [];
                this.chunksSize = 0;
                callback();
            }
        })
    }

    _destroy(error, callback) {
        if (this.fd) {
            let writeErr, readErr = -1;
            fs.close(this.writeFd, (err) => writeErr = err);
            fs.close(this.readFd, (err) => readErr = err);
            callback(writeErr || readErr || error)
        } else {
            callback(error)
        }
    }
}

const duplex = new DuplexStream({ readFilename: "read.txt", writeFilename: "write.txt" });
duplex.write(Buffer.from("This is a string 0.\n"))
duplex.write(Buffer.from("This is a string 1.\n"))
duplex.write(Buffer.from("This is a string 2.\n"))
duplex.write(Buffer.from("This is a string 3.\n"))
duplex.end(Buffer.from("End of write.\n"))

duplex.on("data", (chunk) => {
    console.log(chunk.toString("utf-8"))
})