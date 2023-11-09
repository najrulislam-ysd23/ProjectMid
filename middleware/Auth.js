const HTTP_STATUS = require("../constants/statusCodes");
const { failure } = require("../util/common");
const jsonwebtoken = require('jsonwebtoken');
const logger = require("../middleware/logger");
let logEntry;



class auth {
    async isAuthorized(req, res, next) {
        try {
            if (!req.headers.authorization) {
                logEntry = `${req.url} | status: auth error | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Unauthorized access"));
            }
            const jwt = req.headers.authorization.split(" ")[1];

            const validate = jsonwebtoken.verify(jwt, process.env.SECRET_KEY);
            if (validate) {

                next();
            } else {
                logEntry = `${req.url} | status: auth error | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Unauthorized access"));
            }
        } catch (error) {
            console.log(error);
            if (error instanceof jsonwebtoken.TokenExpiredError) {
                logEntry = `${req.url} | status: auth error | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Please log in again"));
            }
            if (error instanceof jsonwebtoken.JsonWebTokenError) {
                logEntry = `${req.url} | status: auth error | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Please log in again"));
            }
            logEntry = `${req.url} | status: auth error | timestamp: ${new Date().toLocaleString()}\n`;
            logger.addLog(logEntry);
            return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Try again"));
        }
    }

    async isAdmin(req, res, next) {
        try {
            const jwt = req.headers.authorization.split(" ")[1];

            const decoded = jsonwebtoken.decode(jwt);
            if (decoded.role === "admin") {
                next();
            } else {
                logEntry = `${req.url} | status: auth error | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Access denied"));
            }
        } catch (error) {
            console.log(error);
            if (error instanceof jsonwebtoken.TokenExpiredError) {
                logEntry = `${req.url} | status: auth error | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Please log in again"));
            }
            if (error instanceof jsonwebtoken.JsonWebTokenError) {
                logEntry = `${req.url} | status: auth error | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Please log in again"));
            }
            logEntry = `${req.url} | status: auth error | timestamp: ${new Date().toLocaleString()}\n`;
            logger.addLog(logEntry);
            return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Try again"));
        }
    }

    async isCustomer(req, res, next) {
        try {
            const jwt = req.headers.authorization.split(" ")[1];

            const decoded = jsonwebtoken.decode(jwt);
            if (decoded.role === "customer") {

                next();
            } else {
                logEntry = `${req.url} | status: auth error | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Access denied"));
            }
        } catch (error) {
            console.log(error);
            if (error instanceof jsonwebtoken.TokenExpiredError) {
                logEntry = `${req.url} | status: auth error | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Please log in again"));
            }
            if (error instanceof jsonwebtoken.JsonWebTokenError) {
                logEntry = `${req.url} | status: auth error | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Please log in again"));
            }
            logEntry = `${req.url} | status: auth error | timestamp: ${new Date().toLocaleString()}\n`;
            logger.addLog(logEntry);
            return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Try again"));
        }
    }


}



module.exports = new auth();