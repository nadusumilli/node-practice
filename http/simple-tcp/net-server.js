const net = require("net");

const server = net.createServer((socket) => {
    let respData;

    socket.on("data", (data) => {
        respData = data.toString("utf-8");
    });

    socket.write("Thanks!")

    socket.on("end", () => {
        console.log(respData);
        console.log("server stoppping.")
    })
});

server.listen(8080, "127.0.0.1", () => {
    console.log("Opened sever on ", server.address())
});