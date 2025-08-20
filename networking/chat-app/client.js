const net = require("net");
const readLine = require("readline/promises");

const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
});

let CLIENT_ID = ""

const clearLine = (direction) => {
    return new Promise((res, rej) => {
        process.stdout.clearLine(direction, () => {
            res()
        })
    })
}

const moveCursor = (dx, dy) => {
    return new Promise((res, rej) => {
        process.stdout.moveCursor(dx, dy, () => {
            res();
        })
    })
}

const clearRLLine = async () => {
    // log an empty line because we are moving the cursor a line up.
    console.log()
    // move the cursor one line up.
    await moveCursor(0, -1);
    // clear the current line on console.
    await clearLine(0);
}

const ask = async (client, data) => {
    data = data?.length ? data.toString("utf-8") : "";
    if (data?.length && data.includes("id-")) { // This is to ensure that the connection id is displayed to the client!
        await clearRLLine();
        const id = data.replace("id-", "")
        CLIENT_ID = id;
        console.log(`Your connection id is ${CLIENT_ID}\n`);
    } else if (data?.length && data.includes("log: ")) { // This is to ensure that the log boardcasts from server are properly formatted and printed.
        await clearRLLine();
        data = data.substring(5);
        console.log(data);
    } else if (data?.length) { // This is to ensure that the message sent by users are properly formatted.
        await clearRLLine();
        const userMessage = JSON.parse(data)
        console.log(`${userMessage.id === CLIENT_ID ? "> " : "* "}User ${userMessage.id}: ${userMessage.message}`);
    }
    const message = await rl.question("Enter a message > ");
    // move the cursor one line up.
    await moveCursor(0, -1);
    // clear the current line on console.
    await clearLine(0);
    client.write(Buffer.from(JSON.stringify({ id: CLIENT_ID, message })));
}

const client = net.createConnection({ host: "127.0.0.1", port: "8080" }, async () => {
    console.log("-------------------------------")
    console.log("# Welcome to the chat server. #")
    console.log("-------------------------------")
    ask(client);
});


client.on("data", async (chunk) => {
    ask(client, chunk);
})


client.on("end", () => {
    console.log("Connection was ended!")
})