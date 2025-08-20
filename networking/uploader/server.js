const net = require("net");
const fs = require("fs/promises");
const server = net.createServer(() => { });

server.on("connection", async (socket) => {
    // variables for file handlers and write streams.
    let fileHanler;
    let writeStream;

    socket.on("data", async (chunk) => {
        const str = chunk.toString("utf-8");
        if (!fileHanler) {
            // pause streaming till we have a proper handler to handle the data.
            socket.pause();
        }

        // This is the first chunk that will create the file handler with the provided filename.
        if (str.includes("isFileName")) {
            let fileDetails = JSON.parse(str);
            fileHanler = await fs.open(`storage/${fileDetails.filename}`, "w");
            writeStream = fileHanler.createWriteStream();
            socket.resume();
        } else {
            // This is the portion where we actually write to the file.
            if (!writeStream.write(chunk)) {
                // pause if the writable water mark is full.
                socket.pause();
            }
        }

        // When the water mark is full the drain event is emitted then we resume the socket streaming again.
        writeStream.on("drain", () => {
            socket.resume();
        })
    })

    // This end event happens when the client js file ends the socket.
    socket.on("end", () => {
        console.log("Connection ended.");
        fileHanler.close();
    })


})

server.listen(5050, "::1", () => {
    console.log("Uploader server opened on ", server.address())
})