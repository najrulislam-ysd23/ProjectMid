const rateLimit = require("express-rate-limit");
const { failure, success } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");


const limiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 5,
    message: failure("Too many attempts, Please try again after some time!", HTTP_STATUS.TOO_MANY_REQUESTS)
});

module.exports = limiter;