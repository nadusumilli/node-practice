const net = require("net");

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        console.log(data.toString("utf-8"));
    });

    socket.on("end", () => {
        console.log("server stoppping.")
    })
});

server.listen(8080, "127.0.0.1", () => {
    console.log("Opened sever on ", server.address())
});