const { validationResult } = require("express-validator");
const AuthModel = require("../model/Auth");
const UserModel = require("../model/User");
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");
const jsonwebtoken = require("jsonwebtoken");
const logger = require("../middleware/logger");
let logEntry;

class User {
    async getUsers(req, res) {
        try {
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                logEntry = `${req.url} | status: validation error | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res
                    .status(HTTP_STATUS.OK)
                    .send(failure("Invalid property input", validation));
            }
            let { page, limit, role, verified, search, sortParam, sortOrder } = req.query;

            const defaultPage = 1;
            const defaultLimit = 3;
            let skipValue = (defaultPage - 1) * defaultLimit;
            let pageNumber = defaultPage;
            if (page > 0 && limit > 0) {
                skipValue = (page - 1) * limit;
                pageNumber = page;
            } else {
                if (page > 0) {
                    // only page given
                    skipValue = (page - 1) * defaultLimit;
                    pageNumber = page;
                } else if (limit > 0) {
                    // only limit given
                    skipValue = (defaultPage - 1) * limit;
                }
            }

            let sortingOrder = -1; // default descending by creation time i.e. recent uploaded products
            if (sortOrder === "asc") {
                sortingOrder = 1;
            }
            let sortObject = {};
            if (sortParam) {
                sortObject = { [`${sortParam}`]: sortingOrder };
            } else if (!sortParam) {
                sortObject = { createdAt: sortingOrder };
            }

            let queryObject = {}; // filter object
            if (role) {
                queryObject.role = role.toLowerCase();
            }
            if (verified) {
                queryObject.verified = verified;
            }


            if (!search) {
                search = "";
            }
            console.log(queryObject, search, sortObject, skipValue, defaultLimit);

            const totalUsers = await AuthModel.find({}).countDocuments();
            const users = await AuthModel.find(queryObject).select("-password -__v")
                .populate("user", "-email -role -__v")
                .or([
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ])
                .sort(sortObject)
                .skip(skipValue)
                .limit(limit || defaultLimit);

            console.log(users);
            if (users.length > 0) {
                logEntry = `${req.url} | status: success | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res.status(HTTP_STATUS.ACCEPTED).send(
                    success("Successfully got the users", {
                        total: totalUsers,
                        pageNo: Number(pageNumber),
                        limit: Number(defaultLimit),
                        countPerPage: users.length,
                        users: users,
                    })
                );
            } else {
                logEntry = `${req.url} | status: failure | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res.status(HTTP_STATUS.NOT_FOUND).send(success("No users were found"));
            }
        } catch (error) {
            console.log(error);
            logEntry = `${req.url} | status: server error | timestamp: ${new Date().toLocaleString()}\n`;
            logger.addLog(logEntry);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error from getAll"));
        }
    }

    async getOneUser(req, res) {
        try {
            const id = req.params.id;
            const user = await UserModel.findOne({ _id: id }).select("-__v -createdAt -updatedAt");
            if (user) {
                logEntry = `${req.url} | status: success | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res.status(HTTP_STATUS.OK).send(success("Successfully received the user", user));
            } else {
                logEntry = `${req.url} | status: failure | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res.status(HTTP_STATUS.OK).send(failure("Failed to receive the user"));
            }
        } catch (error) {
            logEntry = `${req.url} | status: server error | timestamp: ${new Date().toLocaleString()}\n`;
            logger.addLog(logEntry);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error from getOneUser"));
        }
    }

    async updateUser(req, res) {
        try {
            const { role, verified, name, age, area, city, country, cashIn, cashOut } = req.body;
            let updateObject = {};
            const jwt = req.headers.authorization.split(" ")[1];
            const decoded = jsonwebtoken.decode(jwt);
            // console.log(decoded);
            let user;
            if (decoded.role == "admin") {
                const { email } = req.body;
                if (!email) {
                    logEntry = `${req.url} | status: invalid | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res
                        .status(HTTP_STATUS.NOT_ACCEPTABLE)
                        .send(failure("Provide email of the user to update"));
                }
                let userRequested = await AuthModel.findOne({ email: email });
                if (!userRequested) {
                    logEntry = `${req.url} | status: invalid | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res
                        .status(HTTP_STATUS.NOT_FOUND)
                        .send(success("User does not exist"));
                }
                if (name || age || area || city || country) {
                    logEntry = `${req.url} | status: unauthorized | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res
                        .status(HTTP_STATUS.UNAUTHORIZED)
                        .send(failure("You can only update role or verify an user"));
                    // return res.status(HTTP_STATUS.NOT_MODIFIED).send(failure("You can only update role or verify an user"));
                }
                if (role) {
                    updateObject.role = role;
                }
                if (verified) {
                    updateObject.verified = verified;
                }
                if (!role && !verified) {
                    logEntry = `${req.url} | status: invalid | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res
                        .status(HTTP_STATUS.NOT_ACCEPTABLE)
                        .send(
                            failure("Provide valid property/s to update role or verify user")
                        );
                }

                // console.log(updateObject);
                user = await AuthModel.updateOne(
                    { email: email },
                    { $set: updateObject }
                );
            } else if (decoded.role == "customer") {
                const { email } = req.body;
                if (email) {
                    logEntry = `${req.url} | status: invalid | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res
                        .status(HTTP_STATUS.NOT_ACCEPTABLE)
                        .send(failure("Invalid properties"));
                }
                if (!name && !age && !area && !city && !country && !cashIn && !cashOut) {
                    logEntry = `${req.url} | status: invalid | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res.status(HTTP_STATUS.NOT_ACCEPTABLE).send(failure("Provide valid property/s to update"));
                }
                if (name) {
                    updateObject.name = name;
                }
                if (age) {
                    updateObject.age = age;
                }
                if (area) {
                    updateObject.address.area = area;
                }
                if (city) {
                    updateObject.address.city = city;
                }
                if (country) {
                    updateObject.address.country = country;
                }
                let userRequested = await UserModel.findOne({ email: decoded.email });
                if(cashIn && cashOut) {
                    logEntry = `${req.url} | status: request conflict | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res
                            .status(HTTP_STATUS.NOT_ACCEPTABLE)
                            .send(failure("You can not request for both cashIn and cashOut"));
                } else if (cashIn) {
                    const newBalance = userRequested.balance+cashIn;
                    if(cashIn<=50000){
                        updateObject.balance = newBalance;
                    } else {
                        logEntry = `${req.url} | status: validation error | timestamp: ${new Date().toLocaleString()}\n`;
                        logger.addLog(logEntry);
                        return res
                            .status(HTTP_STATUS.NOT_ACCEPTABLE)
                            .send(failure("You can not cash-in more than 50000 at once"));
                    }
                } else if (cashOut) {
                    const newBalance = userRequested.balance-cashOut;
                    if(newBalance>=100){
                        updateObject.balance = newBalance;
                    } else {
                        logEntry = `${req.url} | status: validation error | timestamp: ${new Date().toLocaleString()}\n`;
                        logger.addLog(logEntry);
                        return res
                            .status(HTTP_STATUS.NOT_ACCEPTABLE)
                            .send(failure(`You can not cash-out more than ${userRequested.balance-100}`));
                    }
                }
                user = await UserModel.updateOne(
                    { email: decoded.email },
                    { $set: updateObject }
                );
            }

            if (user) {
                logEntry = `${req.url} | status: success | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res
                    .status(HTTP_STATUS.ACCEPTED)
                    .send(success("Successfully updated"));
            } else {
                logEntry = `${req.url} | status: failure | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res
                    .status(HTTP_STATUS.NOT_MODIFIED)
                    .send(failure("Failed to update"));
            }
        } catch (error) {
            logEntry = `${req.url} | status: server error | timestamp: ${new Date().toLocaleString()}\n`;
            logger.addLog(logEntry);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error while updating user"));
        }
    }

    async deleteUser(req, res) {
        try {
            console.log("executing deleteUser");
            const validation = validationResult(req).array();
            console.log(validation);
            if (validation.length > 0) {
                logEntry = `${req.url} | status: validation error | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res
                    .status(HTTP_STATUS.OK)
                    .send(failure("Validation error", validation));
            }
            const { email } = req.body;
            if (!email) {
                logEntry = `${req.url} | status: invalid | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res
                    .status(HTTP_STATUS.NOT_ACCEPTABLE)
                    .send(failure("Provide email of the user to delete"));
            }
            let userRequested = await AuthModel.findOne({ email: email });
            if (!userRequested) {
                logEntry = `${req.url} | status: invalid | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .send(success("User does not exist"));
            }
            const user = await UserModel.deleteOne({ email: email });

            if (user) {
                const auth = await AuthModel.deleteOne({ email: email });
                if (auth) {
                    logEntry = `${req.url} | status: success | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res
                        .status(HTTP_STATUS.ACCEPTED)
                        .send(success("Successfully deleted the user"));
                } else {
                    logEntry = `${req.url} | status: failure | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res
                        .status(HTTP_STATUS.NOT_FOUND)
                        .send(failure("Failed to delete the user"));
                }
            } else {
                logEntry = `${req.url} | status: failure | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .send(failure("Failed to delete the user"));
            }
        } catch (error) {
            logEntry = `${req.url} | status: server error | timestamp: ${new Date().toLocaleString()}\n`;
            logger.addLog(logEntry);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error while deleting user"));
        }
    }



}

module.exports = new User();
