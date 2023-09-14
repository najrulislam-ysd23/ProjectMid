const rateLimit = require("express-rate-limit");
const { failure, success } = require("../util/common");


const limiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 5,
    message: failure("Too many attempts, Please try again after some time!", 429)
});

module.exports = limiter;