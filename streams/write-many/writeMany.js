// const fs = require("fs/promises");

// Execution Time: 12 seconds
// Cpu Usage: 40% (one core)
// Memory usage: 3000MB
// (async () => {
    //     console.log("started")
    //     console.time("writeMany")
    //     const fileHandler = await fs.open("text.txt", "w")
    //     for (let i = 0; i < 1000000; i++) {
        //         fileHandler.write(` ${i} `)
//     }
//     fileHandler.close()
//     console.timeEnd("writeMany")
// })()

// const fs = require("fs");

// // Execution Time: 6 seconds
// // Cpu Usage: 17% (one core)
// // Memory usage: 27mb
// (async () => {
//     console.time("writeMany")
//     fs.open("text.txt", "w", (err, fd) => {
//         for (let i = 0; i < 1000000; i++) {
//             fs.writeSync(fd, ` ${i} `)
//         }
//         console.timeEnd("writeMany")
//     })
// })()

// const fs = require("fs");

// // Execution Time: 6 seconds
// // Cpu Usage: 17% (one core)
// // Memory usage: 27mb
// (async () => {
//     console.time("writeMany")
//     fs.open("text.txt", "w", (err, fd) => {
//         for (let i = 0; i < 1000000; i++) {
//             const buff = Buffer.from(` ${i} `, "utf-8")
//             fs.writeSync(fd, buff)
//         }
//         console.timeEnd("writeMany")
//     })
// })()


// Don't do it this way in production .
// const fs = require("fs/promises");

// // Execution Time: 12 seconds
// // Cpu Usage: 40% (one core)
// // Memory usage: 3000MB
// (async () => {
//         console.log("started")
//         console.time("writeMany")
//         const fileHandler = await fs.open("text.txt", "w");
//         const writeStream = fileHandler.createWriteStream()
//         for (let i = 0; i < 1000000; i++) {
//             const buff = Buffer.from(` ${i} `, "utf-8")
//                 writeStream.write(buff)
//     }
//     fileHandler.close()
//     console.timeEnd("writeMany")
// })()


// Don't do it this way in production .
const fs = require("fs/promises");

// Execution Time: 12 seconds
// Cpu Usage: 40% (one core)
// Memory usage: 3000MB

const numberOfWrites = 100000;
(async () => {
    console.time("writeMany");
    const fileHandler = await fs.open("text.txt", "w");
    const writableStream = fileHandler.createWriteStream();

    // 8 bits in one byte and 1000 bytes is one kilo byte and 1000 kilo bytes is a mega byte.
    // 1a => each number curresponds to four bites ex: 0001 1010
    // const buff = Buffer.alloc(writableStream.writableHighWaterMark, 10);
    // const buff2 = Buffer.alloc(1, "a");

    // console.log(writableStream.write(buff));
    // console.log(writableStream.write(buff2));

    // writableStream.on("drain", () => {
    //     console.log("wr are now safe tow write more.")
    // });
    let i = 0

    const writeNumbers = () => {
        while (i < numberOfWrites) {
            const buff = Buffer.from(`${i} `, "utf-8")
            i++;

            // this is our last write.
            if(i === (numberOfWrites - 1)) {
                return writableStream.end(buff);
            }
            
            // if stream.write returns false stop the loop.
            if(!writableStream.write(buff)){
                break;
            }
        }
    }

    writeNumbers();

    writableStream.on("drain", () => {
        // Resume our loop once our streams internal buffer is empty.
        writeNumbers();
    })

    // On Finish we close the file and stop the timers.
    writableStream.on("finish", () => {
        console.timeEnd("writeMany");
        fileHandler.close();;
    })
})()