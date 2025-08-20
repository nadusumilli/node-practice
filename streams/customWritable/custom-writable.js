const { Writable } = require("node:stream");
const fs = require("node:fs")

class FileWriteStream extends Writable {
    constructor({ highWaterMark, fileName }) {
        super({ highWaterMark });

        this.fileName = fileName;
        this.fd = -1;
        this.chunks = [];
        this.chunksSize = 0;
        this.writesCount = 0;
    }

    // This will run after the constructor and will hold calling all other methods until the callback is called.
    // If the setup fails we call the callback with an error and stream construction fails.
    // If there is no error the callback is called with no data and the stream continues to its next function.
    _construct(callback) {
        fs.open(this.fileName, "w", (err, id) => {
            if (err) {
                // if we call the callback with arguments that means there is an error and we should not proceed.
                callback(err);
            } else {
                this.fd = id;
                // Triggers the follow up events as there are no errors passed.
                callback();
            }
        });
    }

    _write(chunk, encoding, callback) {
        // do our write operation
        this.chunks.push(chunk);
        this.chunksSize += chunk.length;


        if (this.chunksSize > this.writableHighWaterMark) {
            fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
                if (err) {
                    return callback(err)
                }

                this.chunks = [];
                this.chunksSize = 0;
                ++this.writesCount;
                callback();
            })
        } else {
            // when were done, we should call the callback function.
            callback();
        }
    }

    _final(callback) {
        fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
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
        console.log("number of writes: ", this.writesCount);
        if (this.fd) {
            fs.close(this.fd, (err) => {
                return callback(err || error)
            })
        } else {
            return callback(error);
        }
    }
}

let numberOfWrites = 100000;
(async () => {
    console.time("custom-writable")
    const stream = new FileWriteStream({ highWaterMark: 1800, fileName: "hello.txt" });

    let i = 0;
    const writeMany = () => {
        while (i < numberOfWrites) {
            const content = Buffer.from(`${i} `, "utf-8")
            if (i === numberOfWrites - 1) {
                stream.end(content + '.');
                return;
            }

            if (!stream.write(content)) {
                break;
            };
            i++;
        }
    }
    writeMany();

    stream.on("drain", () => {
        writeMany();
    })

    stream.on("finish", () => {
        console.log("Data streaming compelted.")
        console.timeEnd("custom-writable")
    })
})()