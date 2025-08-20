// const {Buffer} = require("buffer");

// // 0100 1000 0110 1001 0010 0001
// const memoryCont = Buffer.alloc(3);  // 4 bytes (32 bits)

// memoryCont[0] = 0x48
// memoryCont[1] = 0x69
// memoryCont[2] = 0x21



// console.log(memoryCont.toString("utf-8"))
// console.log(memoryCont)

// promises api.
const fs = require("fs/promises");

(async () => {
    try {
        await fs.copyFile("file.txt", "copied-promise.txt");
    } catch(e) {
        console.log(e)
    }
})();


// // callback api.
// const fs = require("fs")

// fs.copyFile("file.txt", "copied-callback.txt", (error) => {
//     if(error) {
//         console.log(error)
//     }
// })

// // synchronous api.
// const fs = require("fs") 