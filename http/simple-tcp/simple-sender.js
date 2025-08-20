const http = require("node:http");

const agent = new http.Agent({ keepAlive: true });

const request = http.request({
    agent,
    host: "localhost",
    port: 8050,
    method: "POST",
    path: "/create-post",
    headers: {
        "Content-Type": "application/json",
        name: "Joe",
    }
});

request.on("response", (response) => {
    let respData;
    response.on("data", (chunk) => {
        respData += chunk.toString()
    })

    response.on("end", () => {
        let data = JSON.parse(respData.substring(9));
        console.log(`Response came with status ${response.statusCode} and data: ${data.message}`)
    })
});

request.end(
    JSON.stringify({
        title: "Title of my post.",
        body: "This is some text and more."
    })
);