const fs = require("fs/promises");

(async () => {
    console.time("readBig");
    const readFileHanlder = await fs.open("big-src.txt", "r");
    const writeFileHanlder = await fs.open("dest.txt", "w");
    const readStream = readFileHanlder.createReadStream({
        highWaterMark: 64 * 1024
    });
    const writeStream = writeFileHanlder.createWriteStream();

    let split = "";
    readStream.on("data", (chunk) => {
        let data = chunk.toString("utf-8").split(" ");
        
        if(Number(data[0]) + 1 !== Number(data[1] - 1)) {
            if(split) data[0] = split.trim() + data[0].trim();
        }

        if(Number(data[data.length - 2]) + 1 !== Number(data[data.length - 1])) {
            split = data.pop();
        }

        data.forEach((item) => {
            if (item % 2 === 0) {
                if(!writeStream.write(`${item} `)) {
                    readStream.pause();
                } 
            }
        })
    });

    writeStream.on("drain", () => {
        readStream.resume();
    })

    readStream.on("end", () => {
        console.log("done reading!")
        console.timeEnd("readBig");
    })

})() 