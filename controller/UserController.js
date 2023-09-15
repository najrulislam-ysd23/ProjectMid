const { validationResult } = require("express-validator");
const UserModel = require("../model/User");
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");


class User {
    async getAll(req, res) {
        try {
            const users = await UserModel.find({});
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

    async getById(req, res) {
        try {
            const { id } = req.params;
            const user = await UserModel.findById({ _id: id });
            if (user) {
                return res.status(HTTP_STATUS.OK).send(success("Successfully received the user", user));
            } else {
                return res.status(HTTP_STATUS.OK).send(failure("Failed to received the user"));
            }
        } catch (error) {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error from getById"));
        }
    }




}

module.exports = new User();

