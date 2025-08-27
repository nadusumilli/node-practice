let { SESSIONS, USERS } = require("../models/index.js")


// Authentication middleware for the custom framework.
const authenticate = (req, res, next) => {
    if (!req.headers.cookie) {
        res.status(401).json({ message: "Sorry bro, Unauthorized!" })
    }

    const token = req.headers.cookie.replace("token=", "")
    const userSession = SESSIONS.find(session => session.token === token);
    if (userSession) {
        const { password, ...authUser } = USERS.find(user => user.id === userSession.userId)
        req.authUser = authUser;
        return next()
    } else {
        res.status(401).json({ message: "Sorry bro, Unauthorized!" })
    }
}

// Creating a body parser for parsing json body.
// This method is only good for bodies that are less than high water mark value.
const bodyParser = (req, res, next) => {
    if (req.headers["content-type"] == null || req.headers["content-type"] !== "application/json") {
        return next();
    }

    let body = "";
    req.on("data", (chunk) => {
        body += chunk.toString("utf-8");

    })

    req.on("end", () => {
        body = JSON.parse(body)
        req.body = body;
        return next();
    })
}

const serveStaticFiles = (req, res, next) => {
    if (req.url.startsWith("/public") || req.url.startsWith("/404")) {
        const fileType = req.url.split(".")[1];
        if (fileType === "js") {
            return res.status(200).sendFile(`.${req.url}`, "text/javascript")
        } else if (fileType === "css") {
            return res.status(200).sendFile(`.${req.url}`, "text/css")
        } else if (fileType === "html") {
            return res.status(200).sendFile(`.${req.url}`, "text/html")
        } else {
            return res.status(404).sendFile('./public/404.html', "text/html")
        }
    } else {
        return next();
    }
}

module.exports = {
    authenticate,
    bodyParser,
    serveStaticFiles
}