const { validationResult } = require("express-validator");
const AuthModel = require("../model/Auth");
const UserModel = require("../model/User");
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");
const jsonwebtoken = require("jsonwebtoken");

class User {
    async getUsers(req, res) {
        try {
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return res
                    .status(HTTP_STATUS.OK)
                    .send(failure("Invalid property input", validation));
            }
            let {page, limit, age, ageCriteria, role, verified, search, sortParam, sortOrder} = req.query;
            
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
            // if (age && ageCriteria) {
            //     queryObject.user.age = { [`$${ageCriteria}`]: age };
            // } else if (ageCriteria && !age) {
            //     return res
            //         .status(HTTP_STATUS.BAD_REQUEST)
            //         .send(failure("Invalid request for filter by age"));
            // } else if (age && !ageCriteria) {
            //     queryObject.user.age = { $eq: age };
            // }


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
                return res.status(HTTP_STATUS.OK).send(
                    success("Successfully got the users", {
                        total: totalUsers,
                        pageNo: Number(pageNumber),
                        limit: Number(defaultLimit),
                        countPerPage: users.length,
                        users: users,
                    })
                );
            } else {
                return res.status(HTTP_STATUS.OK).send(success("No users were found"));
            }
        } catch (error) {
            console.log(error);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error from getAll"));
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
                    return res
                        .status(HTTP_STATUS.NOT_ACCEPTABLE)
                        .send(failure("Provide email of the user to update"));
                }
                let userRequested = await AuthModel.findOne({ email: email });
                if (!userRequested) {
                    return res
                        .status(HTTP_STATUS.NOT_FOUND)
                        .send(success("User does not exist"));
                }
                if (name || age || area || city || country) {
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
                    return res
                        .status(HTTP_STATUS.NOT_ACCEPTABLE)
                        .send(failure("Invalid properties"));
                }
                if (!name && !age && !area && !city && !country) {
                    return res
                        .status(HTTP_STATUS.NOT_ACCEPTABLE)
                        .send(failure("Provide valid property/s to update"));
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
                return res
                    .status(HTTP_STATUS.OK)
                    .send(success("Successfully updated the user", user));
            } else {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .send(failure("Failed to update the user"));
            }
        } catch (error) {
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
                //   return res.status(422).send(failure("Invalid properties", validation));
                return res
                    .status(HTTP_STATUS.OK)
                    .send(failure("Validation error", validation));
            }
            const { email } = req.body;
            if (!email) {
                return res
                    .status(HTTP_STATUS.NOT_ACCEPTABLE)
                    .send(failure("Provide email of the user to delete"));
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
                    return res
                        .status(HTTP_STATUS.ACCEPTED)
                        .send(success("Successfully deleted the user"));
                } else {
                    return res
                        .status(HTTP_STATUS.NOT_FOUND)
                        .send(failure("Failed to delete the user"));
                }
            } else {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .send(failure("Failed to delete the user"));
            }
        } catch (error) {
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error while deleting user"));
        }
    }
}

module.exports = new User();
