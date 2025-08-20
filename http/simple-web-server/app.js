const http = require("node:http");
const fs = require("node:fs/promises");

const server = http.createServer();

server.on("request", async (req, res) => {
    if (req.method === "GET" && req.url === "/") {
        res.setHeader("Contet-Type", "text/html");
        const fileHandler = await fs.open("./static/index.html", "r");
        const readStream = fileHandler.createReadStream();

        readStream.pipe(res);
    }

    if (req.method === "GET" && req.url.includes("/static")) {
        res.setHeader("Content-Type", req.url.includes("css") ? "text/css" : "text/javascript");
        const fileHandler = await fs.open("." + req.url, "r");
        const readStream = fileHandler.createReadStream();

        readStream.pipe(res)
    }

    if (req.method === "POST" && req.url === "/login") {
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200

        res.end(JSON.stringify({ status: 200, message: "Login is successfull.", data: { username: "John", lastname: "Doe", firstname: "Doe", email: "john.doe@yopmail.com" } }))
    }

    if (req.method === "PUT" && req.url === "/user") {
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200

        res.end(JSON.stringify({ status: 200, message: "updated your user info.", data: { username: "John", lastname: "Doe", firstname: "Doe", email: "john.doe@yopmail.com" } }))
    }

    if (req.method === "PUT" && req.url === "/upload") {
        console.log("upload called.");
        const fileHandler = await fs.open("./storage/new_file.txt", "w");
        const writeStream = fileHandler.createWriteStream();

        req.pipe(writeStream);

        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;

        res.end("File has been uploaded.");
    }
})

server.listen(8000, () => {
    console.log("Server listening on http://localhost:8000")
})