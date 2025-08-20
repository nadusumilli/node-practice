const http = require("node:http");
const fs = require("node:fs/promises");
const { Readable } = require("node:stream");

class Inforex {
    constructor() {
        this.server = http.createServer();
        this.routes = {};

        this.server.on("request", (req, res) => {

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

            // if the routes object does not have a key of req.method + req.url, return 404
            if (!this.routes[req.method + " " + req.url]) {
                return res.status(404).json({ message: "This resource does not exist." });
            }

            let i = 0;
            const handleMiddlewareCalls = (i) => {
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

            const cbs = this.routes[req.method + " " + req.url];
            handleMiddlewareCalls(i);
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