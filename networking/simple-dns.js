const dns = require("node:dns/promises");

(async () => {
    const results = await dns.lookup("google.com")

    console.log(results)
})()