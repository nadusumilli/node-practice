const http = require("http");

const PORT = 9000;

const mainServers = [
    { host: "localhost", port: 9001 },
    { host: "localhost", port: 9002 }
]

const proxy = http.createServer();

proxy.on("request", (clientRequest, proxyResponse) => {

    // create a round robin to pick the right server from the proxy.
    const mainServer = mainServers.shift();
    mainServers.push(mainServer);

    console.log(clientRequest.url)

    // crating a http request to send data to the actual server from the proxy.
    const proxyRequest = http.request({
        host: mainServer.host,
        port: mainServer.port,
        path: clientRequest.url,
        method: clientRequest.method,
        headers: clientRequest.headers
    });

    // on response from the main server, we add headers to the proxy response and copy the data from the main server to the proxy response.
    proxyRequest.on("response", (mainServerResponse) => {
        console.log(clientRequest.url);
        proxyResponse.writeHead(
            mainServerResponse.statusCode,
            mainServerResponse.headers
        )

        mainServerResponse.pipe(proxyResponse);
    });

    // we are sending the client request details to the proxy request that we are sending to the actual server.
    clientRequest.pipe(proxyRequest);
})

proxy.listen(PORT, () => {
    console.log("Proxy server listening on port 9000");
})