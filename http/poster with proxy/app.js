const Inforex = require("./inforex");

const PORT = 9001;
const server = new Inforex();

const USERS = [
    { id: 1, name: "Liam Brown", username: "laim23", password: "string" },
    { id: 2, name: "Adam Brown", username: "adam23", password: "string" },
    { id: 3, name: "Ben Brown", username: "ben23", password: "string" }
];

let selectedUser;

const POSTS = [
    { id: 1, title: "This is the first post.", body: "lorem ipsum data is here for the conte of the post there is so much data that i cannot evcen fathom.", userId: 1 },
    { id: 1, title: "This is the second post.", body: "lorem ipsum data is here for the conte of the post there is so much data that i cannot evcen fathom.", userId: 2 }
];

//--------- Files routes ------------//
server.route("get", "/", (req, res) => {
    res.status(200).sendFile("./public/index.html", "text/html")
})

server.route("get", "/public/styles.css", (req, res) => {
    res.status(200).sendFile("./public/styles.css", "text/css")
})

server.route("get", "/public/scripts.js", (req, res, next) => {
    console.log("Middleware running before serving script.");
    next();
}, (req, res) => {
    res.status(200).sendFile("./public/scripts.js", "text/javascript")
})

//--------- JSON routes ------------//
server.route("get", "/api/posts", (req, res) => {
    res.status(200).json(POSTS.map((post) => ({ ...post, author: USERS.find((user) => user.id === post.userId).name })))
})

server.route("get", "/api/user", (req, res) => {
    console.log(req.body);
    res.status(404).json(req.authUser);
})

server.route("post", "/api/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const user = USERS.find((user) => user.username === username);
    if (user.username !== username || user.password !== password) {
        res.status(401).json({ error: "Please enter valid credentials." })
    }
    req.authUser = user;
    res.status(200).json({ message: "User logged in successfully." });
})

server.listen(PORT, () => {
    console.log(`\nPoster application started on http://localhost:${PORT}`);
})