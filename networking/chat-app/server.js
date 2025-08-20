const net = require("net")

const PORT = 8080;
const HOST = "127.0.0.1"

const server = net.createServer();

// An array of client sockets.
const clients = []

server.on("connection", (socket) => {
    const clientId = clients.length + 1;

    socket.write(`id-${clientId}`)

    console.log("A new connection to the server!");

    // Broadcasting a message when someone joines the chat room.
    clients.forEach((client, idx) => {
        if (clientId !== idx)
            client.socket.write(`log: User ${clientId} has joined the chat room.`)
    })

    // on getting data we broadcast it to all the users.
    socket.on("data", (chunk) => {
        clients.forEach((client) => {
            client.socket.write(chunk);
        });
    });

    const handleClientLeave = () => {
        clients.forEach((client) => {
            client.socket.write(`log: User ${clientId} left the chatroom.`)
        })
    }

    // Broadcasting a message when someone leaves the chat room for windows.
    socket.on("error", () => {
        handleClientLeave()
    });

    // Broadcasting a message when someone leaves the chat room.
    socket.on("end", () => {
        handleClientLeave()
    });

    clients.push({ id: clientId, socket });
});


server.listen(PORT, HOST, () => {
    const address = server.address();
    console.log(`Server started on http://${address.address}:${address.port}`)
})