const net = require("net");

const socket = net.createConnection({ host: "127.0.0.1", port: 8080 }, () => {
    socket.write("A simple message coming from a simple sender.");
});
