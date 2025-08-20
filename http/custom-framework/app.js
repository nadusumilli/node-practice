const Inforex = require("./inforex");

const PORT = 8000;
const server = new Inforex();

server.route("get", "/", (req, res) => {
    res.status(200).sendFile("./public/index.html", "text/html")
});

server.route("get", "/public/styles.css", (req, res) => {
    res.status(200).sendFile("./public/styles.css", "text/css")
});

server.route("get", "/public/script.js", (req, res, next) => {
    console.log("middleware ran first.");
    next();
}, (req, res) => {
    res.status(200).sendFile("./public/script.js", "text/javascript")
});

server.route("get", "/hello", (req, res) => {
    res.status(200).json(
        [
            { name: "Hello", age: "24" },
            { name: "Hello", age: "24" },
            { name: "Hello", age: "24" },
            { name: "Hello", age: "24" },
            { name: "Hello", age: "24" }
        ]
    )
});

server.route("get", "/login", (req, res) => {
    res.status(400).json(
        { message: "Bad request for login..." }
    )
});

server.listen(PORT, () => {
    console.log("Server started on port: ", PORT)
})