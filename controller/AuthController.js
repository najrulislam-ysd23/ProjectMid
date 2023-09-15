const { validationResult } = require("express-validator");
const AuthModel = require("../model/Auth");
const UserModel = require("../model/User");
const HTTP_STATUS = require("../constants/statusCodes");
const { failure, success } = require("../util/common");
const bcrypt = require("bcrypt");
const jsonwebtoken = require('jsonwebtoken');

class AuthController {

    async login(req, res) {
        try {
            // Checking if all the properties are valid in the request body
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure("Provide information correctly", validation));
            }

            const { email, password } = req.body;
            const existingUser = await AuthModel.findOne({ email: email })
            // Checking if the user has an account
            if (!existingUser) {
                return res.status(HTTP_STATUS.OK).send(failure("Create an account first"));
            }
            // Checking if the user's account is verified
            if (!existingUser.verified) {
                return res.status(HTTP_STATUS.OK).send(failure("Verify your email and then log in"));
            }

            // Matching password
            const checkPassword = await bcrypt.compare(password, existingUser.password);
            if (checkPassword) {
                const userInfo = await AuthModel.findOne({ email: email }).select("email role -_id")
                    .populate("user", "name age address -_id")

                const responseUserInfo = userInfo.toObject();

                const jwt = jsonwebtoken.sign(responseUserInfo, process.env.SECRET_KEY, { expiresIn: "1h" }); console.log(jwt);
                responseUserInfo.token = jwt; console.log(responseUserInfo);
                return res.status(HTTP_STATUS.OK).send(success("Successfully logged in", responseUserInfo));
            } else {

                return res.status(HTTP_STATUS.OK).send(failure("Invalid credentials"));
            }
        }
        catch (error) {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
        }
    }
    async signup(req, res) {
        try {
            // Checking if all the properties are valid in the request body
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure("Provide information correctly", validation));
            }

            const { name, email, password, confirmPassword, role, age, address } = req.body;

            if (password != confirmPassword) {
                return res.status(HTTP_STATUS.OK).send(failure("Passwords did not match."));
            }

            const existingUser = await AuthModel.findOne({ email: email })
            // Checking if the user already has an account
            if (existingUser) {
                return res.status(HTTP_STATUS.OK).send(failure("You have an account, please log in to access."));
            }
            // Creating user instance
            const user = new UserModel({ name, email, role, age, address });
            await user
                .save()
                .then((data) => {
                    console.log("Success")
                })
                .catch((err) => {
                    console.log(err);
                    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure("Failed to signup"));
                });
            console.log("reached")
            const fetchUser = await UserModel.findOne({ email: email });
            // Fetching user id for the ref in the auth instance
            const fetchUserId = fetchUser._id;

            const hashedPassword = await bcrypt.hash(password, 10).then((hash) => {
                return hash;
            });
            // Creating auth instance
            const auth = new AuthModel({ email, password: hashedPassword, role, user: fetchUserId })
            await auth
                .save()
                .then((data) => {
                    return res.status(HTTP_STATUS.OK).send(success("Successfully signed up. Now you can log in."));
                })
                .catch((err) => {
                    console.log(err);
                    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure("Failed to signup"));
                });

        } catch (error) {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
        }
    }
}

module.exports = new AuthController();