const net = require("net");
const fs = require("fs/promises");
const path = require("path");

const socket = net.createConnection({ host: "::1", port: "5050" }, async () => {

    let filePath = process.argv[2];
    if (!filePath) {
        filePath = path.resolve(path.dirname, "./text.txt");
    }
    let filename = path.basename(filePath);
    const fileHanler = await fs.open(filePath, "r");
    const readStream = fileHanler.createReadStream();

    // Emitting the file details to the server.
    socket.write(JSON.stringify({ filename, isFileName: true }));

    // reading from the source file and writing to the socket to send to server.
    readStream.on("data", (data) => {
        // pausing stream when the write socket memory is utilized.
        if (!socket.write(data)) {
            readStream.pause();
        }
    })

    // the drain is called once the memory is full to ensure that we send all that data.
    socket.on("drain", () => {
        readStream.resume();
    })

    // This is a disconnection from the server, we log and cleanup resources.
    readStream.on("end", () => {
        console.log("file streaming completed.")
        fileHanler.close()
        socket.end()
    })

})