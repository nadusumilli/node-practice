const { Readable } = require("node:stream");
const fs = require("node:fs");

class FileReaderStream extends Readable {
    constructor({ highWaterMark, filename }) {
        super({ highWaterMark })

        this.filename = filename;
        this.fd = -1;
    }

    _construct(callback) {
        fs.open(this.filename, "r", (err, id) => {
            if (err) return callback(err);

            this.fd = id;
            callback();
        })
    }

    _read(size) {
        const data = Buffer.alloc(size)
        fs.read(this.fd, data, 0, size, null, (err, bytesRead) => {
            if (err) return this.destroy(err);

            // Null being passed here is to indicate the end of the stream.
            this.push(bytesRead > 0 ? data.subarray(0, bytesRead) : null);
        })
    }

    _destroy(error, callback) {
        if (this.fd) {
            fs.close(this.fd, (err) => callback(err || error))
        } else {
            callback(error)
        }
    }
}


const stream = new FileReaderStream({ filename: "hello.txt" });
stream.on("data", (chunk) => {
    console.log(chunk.toString("utf-8"));
})

stream.on("end", () => {
    console.log("Data reading is completed.")
})