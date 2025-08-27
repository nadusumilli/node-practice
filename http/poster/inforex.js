const http = require("node:http");
const fs = require("node:fs/promises");
const { Readable } = require("node:stream");

class Inforex {
    constructor() {
        this.server = http.createServer();
        this.routes = {};
        this.middlewares = [];

        this.server.on("request", async (req, res) => {

            // setup all the different functions to write to the response stream.
            res = this._setupResponseMethods(res);

            // Middleware handling and route management.
            await this._handleRoutes(req, res);
        })
    }

    _handleRoutes(req, res) {
        // if the routes object does not have a key of req.method + req.url, return 404
        if (!this.routes[req.method + " " + req.url] && (!req.method || !req.url.startsWith("/public"))) {
            req.url = "/404"
        }

        // Recursive function that runs all the middleware and runs the actual request at the end.
        const runMiddleware = (req, res, middlewares, index) => {
            if (index === middlewares.length) {
                const request = middlewares.pop();
                request(req, res);
            } else {
                middlewares[index](req, res, (err, name = "") => {
                    if (err) { return res.status(500).json({ message: `${name}: Experiencing issues: ${err}` }) }
                    runMiddleware(req, res, middlewares, index + 1);
                })
            }
        }

        // creating all the callbacks and then calling the middleware function.
        if (this.routes[req.method + " " + req.url] != null) {
            let cbs = [...this.middlewares, ...(Array.isArray(this.routes[req.method + " " + req.url]) ? this.routes[req.method + " " + req.url] : [this.routes[req.method + " " + req.url]])];
            runMiddleware(req, res, cbs, 0);
        } else {
            runMiddleware(req, res, this.middlewares, 0);
        }
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
                // This method is only good for bodies that are less than high water mark value.
                res.end(JSON.stringify(jsonData))
            }
        }

        res.status = (status) => {
            res.statusCode = status
            if (status === 204) {
                res.end()
            }
            return res
        };

        return res;
    }

    listen(port, cb) {
        this.server.listen(port, () => cb())
    }

    route = (method, url, ...cb) => {
        this.routes[method.toUpperCase() + " " + url] = cb
    }

    get = (url, ...cb) => {
        this.route("get", url, ...cb);
    }

    post = (url, ...cb) => {
        this.route("post", url, ...cb);
    }

    put = (url, ...cb) => {
        this.route("put", url, ...cb);
    }

    patch = (url, ...cb) => {
        this.route("patch", url, ...cb);
    }

    delete = (url, ...cb) => {
        this.route("delete", url, ...cb);
    }

    use = (cb) => {
        this.middlewares.push(cb);
    }
}

module.exports = Inforex