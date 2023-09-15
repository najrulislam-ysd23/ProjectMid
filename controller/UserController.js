const { validationResult } = require("express-validator");
const AuthModel = require("../model/Auth");
const UserModel = require("../model/User");
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");
const jsonwebtoken = require('jsonwebtoken');




class User {
    async getAll(req, res) {
        try {
            const users = await UserModel.find({})
                .sort("-createdAt");
            console.log(users);
            if (users.length > 0) {
                return res.status(HTTP_STATUS.OK).send(success("Successfully got all the users", { users, total: users.length }));
            } else {
                return res.status(HTTP_STATUS.OK).send(success("No users were found"));
            }
        } catch (error) {
            console.log(error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error from getAll"));
        }
    }

    async getOne(req, res) {
        try {
            const { email } = req.body;
            const user = await AuthModel.findOne({ email: email })
                .populate("user", "-__v");
            if (user) {
                return res.status(HTTP_STATUS.OK).send(success("Successfully received the user", user));
            } else {
                return res.status(HTTP_STATUS.OK).send(failure("Failed to received the user"));
            }
        } catch (error) {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error from getOneUser"));
        }
    }

    async updateUser(req, res) {
        try {
            console.log("executing updateUser");

            const { role, verified, name, age, area, city, country } = req.body;
            let updateObject = {};
            const jwt = req.headers.authorization.split(" ")[1];
            const decoded = jsonwebtoken.decode(jwt);
            // console.log(decoded);
            let user;
            if (decoded.role == "admin") {
                const { email } = req.body;
                if (!email) {
                    return res.status(HTTP_STATUS.NOT_ACCEPTABLE).send(failure("Provide email of the user to update"));
                }
                let userRequested = await AuthModel.findOne({ email: email });
                if (!userRequested) {
                    return res
                        .status(HTTP_STATUS.NOT_FOUND)
                        .send(success("User does not exist"));
                }
                if (name || age || area || city || country) {
                    return res.status(HTTP_STATUS.UNAUTHORIZED).send(failure("You can only update role or verify an user"));
                    // return res.status(HTTP_STATUS.NOT_MODIFIED).send(failure("You can only update role or verify an user"));
                }
                if (role) {
                    updateObject.role = role;
                }
                if (verified) {
                    updateObject.verified = verified;
                }
                if (!role && !verified) {
                    return res.status(HTTP_STATUS.NOT_ACCEPTABLE).send(failure("Provide valid property/s to update role or verify user"));
                }

                // console.log(updateObject);
                user = await AuthModel.updateOne(
                    { email: email },
                    { $set: updateObject }
                );
            } else if (decoded.role == "customer") {
                const { email } = req.body;
                if (email) {
                    return res.status(HTTP_STATUS.NOT_ACCEPTABLE).send(failure("Invalid properties"));
                }
                if (!name && !age && !area && !city && !country) {
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
                user = await UserModel.updateOne(
                    { email: decoded.email },
                    { $set: updateObject }
                );
            }

            if (user) {
                return res.status(HTTP_STATUS.OK).send(success("Successfully updated the user", user));
            } else {
                return res.status(HTTP_STATUS.NOT_FOUND).send(failure("Failed to update the user"));
            }
        } catch (error) {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error while updating user"));
        }
    }

    async deleteUser(req, res) {
        try {
            console.log("executing deleteUser");
            const validation = validationResult(req).array();
            console.log(validation);
            if (validation.length > 0) {
                //   return res.status(422).send(failure("Invalid properties", validation));
                return res
                    .status(HTTP_STATUS.OK)
                    .send(failure("Validation error", validation));
            }
            const { email } = req.body;
            if (!email) {
                return res.status(HTTP_STATUS.NOT_ACCEPTABLE).send(failure("Provide email of the user to delete"));
            }
            let userRequested = await AuthModel.findOne({ email: email });
            if (!userRequested) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .send(success("User does not exist"));
            }
            const user = await UserModel.deleteOne({ email: email });

            if (user) {
                const auth = await AuthModel.deleteOne({ email: email });
                if (auth) {
                    return res.status(HTTP_STATUS.ACCEPTED).send(success("Successfully deleted the user"));
                } else {
                    return res.status(HTTP_STATUS.NOT_FOUND).send(failure("Failed to delete the user"));
                }

            } else {
                return res.status(HTTP_STATUS.NOT_FOUND).send(failure("Failed to delete the user"));
            }
        } catch (error) {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error while deleting user"));
        }
    }




}

module.exports = new User();

