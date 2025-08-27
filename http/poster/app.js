const Inforex = require("./inforex");
const { bodyParser, serveStaticFiles, authenticate } = require("./middleware/index.js");
let { SESSIONS, USERS, POSTS } = require("./models/index.js");
const { PORT } = require("./utils/constants.js")

// Create a new server instance.
const server = new Inforex();

// Middleware to enable the static file routing.
server.use(bodyParser);
server.use(serveStaticFiles);


//--------- Files routes ------------//
server.get("/", (req, res) => {
    return res.status(200).sendFile("./public/index.html", "text/html")
})

//--------- JSON routes ------------//
server.get("/api/posts", (req, res) => {
    res.status(200).json(POSTS.map((post) => ({ ...post, author: USERS.find((user) => user.id === post.userId).name })))
})

server.post("/api/posts", authenticate, (req, res) => {
    const title = req.body.title;
    const body = req.body.body;

    POSTS.push({ id: POSTS.length + 1, title, body, userId: req.authUser.id })
    res.status(201).json({ message: "Post created successfully." });
})

server.put("/api/user", authenticate, (req, res) => {
    const username = req.body.username;
    const name = req.body.name;
    const password = req.body.password;

    const idx = USERS.findIndex(user => user.id === req.authUser.id)
    if (idx >= 0) {
        USERS.splice(idx, 0, { ...USERS[idx], username, name, ...(password ? { password } : {}) })
    }

    res.status(201).json({ message: "User details updated." })
})

server.get("/api/user", authenticate, (req, res) => {
    res.status(200).json(req.authUser);
})

server.delete("/api/logout", authenticate, (req, res) => {
    // Clearing the sessions for the authenticated user.
    const user = req.authUser;
    let idx = SESSIONS.findIndex(session => session.userId === user.id);
    if (idx >= 0)
        SESSIONS.splice(idx, 1);
    res.setHeader("Set-Cookie", `token=deleted; Path=/;`)
    res.status(204);
})

server.post("/api/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const user = USERS.find((user) => user.username === username);
    if (user == null || user.username !== username || user.password !== password) {
        return res.status(401).json({ error: "Please enter valid credentials." })
    }

    // Generate a random ten digit token.
    const token = (Math.random() * 10000000000).toFixed(0).toString();

    // save the generated token.
    SESSIONS.push({ userId: user.id, token });

    req.authUser = user;

    res.setHeader("Set-Cookie", `token=${token}; Path=/;`)
    res.status(200).json({ message: "User logged in successfully." });
})

server.listen(PORT, () => {
    console.log(`\nPoster application started on http://localhost:${PORT}`);
})