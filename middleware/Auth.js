const HTTP_STATUS = require("../constants/statusCodes");
const { failure } = require("../util/common");
const jsonwebtoken = require('jsonwebtoken');



class auth {
    async isAuthorized(req, res, next) {
        console.log("i am here now");
        try {
            if (!req.headers.authorization) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Unauthorized access"));
            }
            const jwt = req.headers.authorization.split(" ")[1];

            const validate = jsonwebtoken.verify(jwt, process.env.SECRET_KEY);
            console.log(validate);
            if (validate) {

                next();
            } else {
                return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Unauthorized access"));
            }
        } catch (error) {
            console.log(error);
            if (error instanceof jsonwebtoken.TokenExpiredError) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Please log in again"));
            }
            if (error instanceof jsonwebtoken.JsonWebTokenError) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Please log in again"));
            }
            return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Try again"));
        }
    }

    async isAdmin(req, res, next) {
        try {
            const jwt = req.headers.authorization.split(" ")[1];

            const decoded = jsonwebtoken.decode(jwt);
            console.log(decoded);
            if (decoded.role === "admin") {

                next();
            } else {
                return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Access denied"));
            }
        } catch (error) {
            console.log(error);
            if (error instanceof jsonwebtoken.TokenExpiredError) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Please log in again"));
            }
            if (error instanceof jsonwebtoken.JsonWebTokenError) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Try again"));
            }
            return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("Try again"));
        }
    }




}



module.exports = new auth();