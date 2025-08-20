const http = require("node:http");
const fs = require("node:fs/promises");
const { Readable } = require("node:stream");

class Inforex {
    constructor() {
        this.server = http.createServer();
        this.routes = {};

        this.server.on("request", async (req, res) => {

            // setup all the different functions to write to the response stream.
            res = this._setupResponseMethods(res);

            // setup all the different functions to read the request stream.
            req = await this._setupRequestMethods(req);

            // Middleware handling and route management.
            await this._handleRoutes(req, res);
        })
    }

    _handleRoutes(req, res) {
        // if the routes object does not have a key of req.method + req.url, return 404
        if (!this.routes[req.method + " " + req.url]) {
            console.log(req.method, req.url)
            if (req.method !== "GET") {
                return res.status(404).json({ message: "This resource does not exist." });
            }
            req.url = "*"
        }

        const handleMiddlewareCalls = (i = 0) => {
            while (i < cbs.length) {
                if (i !== cbs.length - 1) {
                    cbs[i](req, res, (err) => {
                        if (err) { return res.status(500).json({ message: "something fucked up" }) }
                        handleMiddlewareCalls(i + 1);
                    })
                    return;
                } else {
                    cbs[i](req, res)
                }
                i++;
            }
        }

        // creating all the callbacks and then calling the middleware function.
        const cbs = this.routes[req.method + " " + req.url];
        handleMiddlewareCalls();
    }

    _setupResponseMethods(res) {
        // create a sendFile function that takes a filePath and mime type and sends the file response.
        res.sendFile = async (filePath, mimeType) => {
            res.setHeader("Content-Type", mimeType)
            const fileHandler = await fs.open(filePath, "r");
            const readStream = fileHandler.createReadStream();

            readStream.pipe(res);
        }

        res.json = async (jsonData) => {
            res.setHeader("Content-Type", "application/json")
            if (Array.isArray(jsonData)) {
                const readable = new Readable({
                    read() {
                        let data = jsonData.shift();
                        while (data) {
                            const chunk = JSON.stringify(data) + (jsonData.length ? ',' : '');
                            this.push(chunk);
                            data = jsonData.shift();
                        }

                        if (jsonData.length === 0) {
                            this.push(null)
                        }
                    }
                });

                res.write("[")
                readable.on("end", () => {
                    res.write("]")
                })
                readable.pipe(res)
            } else {
                res.end(JSON.stringify(jsonData))
            }
        }

        res.status = (status) => {
            res.statusCode = status
            return res
        };

        return res;
    }

    _setupRequestMethods(req) {
        return new Promise((res, rej) => {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk.toString("utf-8");
            })

            req.on("end", () => {
                if (body) {
                    req.body = JSON.parse(body);
                }
                res(req);
            })
        })
    }

    listen(port, cb) {
        this.server.listen(port, () => cb())
    }

    route = (method, url, ...cb) => {
        this.routes[method.toUpperCase() + " " + url] = cb
    }
}

module.exports = Inforex