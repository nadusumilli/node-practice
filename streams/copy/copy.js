const fs = require("fs/promises");

(async () => {
    const readFileHandler = await fs.open("src.txt", "r");
    const writeFileHandler = await fs.open("dest.txt", "w");

    // let bytesRead = -1;
    // while(bytesRead !== 0) {
    //     const readResult = await readFileHandler.read();
    //     bytesRead = readResult.bytesRead;

    //     let newBuffer;
    //     if(bytesRead !== 16384) {
    //         const indexOfNotFilled = readResult.buffer.indexOf(0);
    //         newBuffer = Buffer.alloc(indexOfNotFilled);
    //         readResult.buffer.copy(newBuffer, 0, 0, indexOfNotFilled);
    //     }
    //     writeFileHandler.write(newBuffer ? newBuffer : readResult.buffer);
    // }


    const readStream = readFileHandler.createReadStream();
    const writeStream = writeFileHandler.createWriteStream();

    readStream.pipe(writeStream);
})()