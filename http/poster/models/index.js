
const USERS = [
    { id: 1, name: "Liam Brown", username: "laim23", password: "string" },
    { id: 2, name: "Adam Brown", username: "adam23", password: "string" },
    { id: 3, name: "Ben Brown", username: "ben23", password: "string" }
];

// a sample object in this array would look like:
// { userId: 1, token: 3243789534 }
const SESSIONS = [];

const POSTS = [
    { id: 1, title: "This is the first post.", body: "lorem ipsum data is here for the conte of the post there is so much data that i cannot evcen fathom.", userId: 1 },
    { id: 2, title: "This is the second post.", body: "lorem ipsum data is here for the conte of the post there is so much data that i cannot evcen fathom.", userId: 2 }
];

module.exports = {
    USERS,
    SESSIONS,
    POSTS
}