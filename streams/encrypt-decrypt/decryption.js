const fs = require("node:fs/promises");
const { Transform } = require("node:stream");


// encryption / decryption and compression / decompression and hashing and salting and decoding and encoding.
class Decrypt extends Transform {
    _transform(chunk, encoding, callback) {
        console.log(chunk.toString("utf-8"))
        // after we are done with the transform.
        // we can either push or we can call the callback with the chunk.
        // callback the first parameter is error and the second is chunk.

        for (let i = 0; i < chunk.length; ++i) {
            if (chunk[i] !== 255) {
                chunk[i] -= 1
            }
            console.log(`Decryption in progress: ${Math.floor(((i + 1) / chunk.length) * 100)}% completed`);
        }
        callback(null, chunk);
    }
}

(async () => {
    const readFileHandle = await fs.open("write.txt", "r")
    const writeFileHandle = await fs.open("decrypted.txt", "w")

    const readStream = readFileHandle.createReadStream()
    const writeStream = writeFileHandle.createWriteStream()

    const decrypt = new Decrypt();
    readStream.pipe(decrypt).pipe(writeStream);

})()



