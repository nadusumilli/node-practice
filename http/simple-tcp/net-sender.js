const net = require("net");

const socket = net.createConnection({ host: "localhost", port: 8080 }, () => {
    // If we manage to send the whole data for the http request in the buffer form, it is accepted.
    const buff = Buffer.from("POST \/create-post HTTP\/1.1\r\nContent-Type: application\/json\r\nname: Joe\r\nHost: localhost:8050\r\nConnection: keep-apive\r\nContent-Length: 75\r\n\r\n");

    const buff2 = Buffer.from("{\"title\":\"Title of my post\", \"body\":\"There is some text and more and more\"}\r\n\r\n");
    socket.end(Buffer.concat([buff, buff2]));

    socket.on("data", (chunks) => {
        console.log("Received Response:");
        console.log(chunks.toString("utf-8"));
        socket.end();
    })

    socket.on("end", () => {
        console.log("connection closed.")
    })
});
