const http = require("node:http");

const server = http.createServer();

// req is a readable stream, and response is a writable stream.
server.on("request", (req, res) => {
    const name = req.headers.name;

    if (req.method === "POST" && req.url === "/create-post") {
        let data;
        req.on("data", (chunk) => {
            data += chunk.toString("utf-8")
        })

        req.on("end", () => {
            console.log(data)
            data = JSON.parse(data.substring(9));
            console.log("reached the ned.")
            console.log(data);


            res.writeHead(200, { "Content-Type": "application/json" })
            res.end(JSON.stringify({ message: `Post with data ${data.title} was created by ${name}` }))
        })
    }
})

server.listen(8050, () => {
    console.log("server started on http://localhost:8050")
})