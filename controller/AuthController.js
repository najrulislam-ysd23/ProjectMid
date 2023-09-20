const { validationResult } = require("express-validator");
const AuthModel = require("../model/Auth");
const UserModel = require("../model/User");
const HTTP_STATUS = require("../constants/statusCodes");
const { failure, success } = require("../util/common");
const bcrypt = require("bcrypt");
const jsonwebtoken = require('jsonwebtoken');
const transporter = require("../middleware/Transporter");
const logger = require("../middleware/logger");
let logEntry;



class AuthController {

    async login(req, res) {
        try {
            // Checking if all the properties are valid in the request body
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                logEntry = `${req.url} | status: validation error | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure("Provide information correctly", validation));
            }
            const { email, password } = req.body;
            const existingUser = await AuthModel.findOne({ email: email })
            // Checking if the user has an account
            if (!existingUser) {
                logEntry = `${req.url} | status: login before signup | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res.status(HTTP_STATUS.OK).send(failure("Create an account first"));
            }
            // Checking if the user's account is verified
            if (!existingUser.verified) {
                logEntry = `${req.url} | status: login before verification | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res.status(HTTP_STATUS.OK).send(failure("Verify your email and then log in"));
            }

            // Matching password
            const checkPassword = await bcrypt.compare(password, existingUser.password);
            if (checkPassword) {

                const userInfo = await AuthModel.findOne({ email: email }).select("email role -_id")
                    .populate("user", "name age address -_id");
                console.log("Auth debug");
                const responseUserInfo = userInfo.toObject();

                const jwt = jsonwebtoken.sign(responseUserInfo, process.env.SECRET_KEY, { expiresIn: "1h" }); console.log(jwt);
                responseUserInfo.token = jwt; console.log(responseUserInfo);
                logEntry = `${req.url} | status: success | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res.status(HTTP_STATUS.OK).send(success("Successfully logged in", responseUserInfo));
            } else {
                logEntry = `${req.url} | status: failure | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res.status(HTTP_STATUS.OK).send(failure("Failed to login"));
            }
        }
        catch (error) {
            logEntry = `${req.url} | status: server error | timestamp: ${new Date().toLocaleString()}\n`;
            logger.addLog(logEntry);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
        }
    }

    // async verifyAccount(req, res) {
    //     try {
    //         // Checking if all the properties are valid in the request body
    //         const validation = validationResult(req).array();
    //         if (validation.length > 0) {
    //             return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure("Provide information correctly", validation));
    //         }

    //         const { name, email, password, confirmPassword, role, age, area, city, country } = req.body;

    //         if (password != confirmPassword) {
    //             return res.status(HTTP_STATUS.OK).send(failure("Passwords did not match."));
    //         }

    //         const existingUser = await AuthModel.findOne({ email: email })
    //         // Checking if the user already has an account
    //         if (existingUser) {
    //             if (existingUser.verified) {
    //                 return res.status(HTTP_STATUS.OK).send(failure("You have an account, please log in to access."));
    //             } else {
    //                 await AuthModel.deleteOne({ email: email, verified: false });
    //                 await UserModel.deleteOne({ email: email });
    //             }
    //         }
    //         // Creating user instance
    //         const address = { area, city, country };
    //         const user = new UserModel({ name, email, role, age, address });
    //         console.log(user, user.address);
    //         await user
    //             .save()
    //             .then((data) => {
    //                 console.log("Success")
    //             })
    //             .catch((err) => {
    //                 console.log(err);
    //                 return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure("Failed to signup"));
    //             });


    //         const fetchUser = await UserModel.findOne({ email: email });
    //         // Fetching user id for the ref in the auth instance
    //         const fetchUserId = fetchUser._id;

    //         const hashedPassword = await bcrypt.hash(password, 10).then((hash) => {
    //             return hash;
    //         });
    //         // Creating auth instance
    //         const auth = new AuthModel({ email, password: hashedPassword, role, user: fetchUserId })
    //         await auth
    //             .save()
    //             .then((data) => {
    //                 // Generate a verification token with the user's ID
    //                 const verificationToken = data.generateVerificationToken();
    //                 // Email the user a unique verification link
    //                 const url = `127.0.0.1:8000/auth/verify/${verificationToken}`
    //                 transporter.sendMail({
    //                     to: email,
    //                     subject: 'Verify Your Account',
    //                     html: `Click <a href = '${url}'>here</a> to confirm your email.`
    //                 })
    //                 return res.status(HTTP_STATUS.CREATED).send(success(`Sent a verification email to ${email}`));
    //                 // return res.status(HTTP_STATUS.CREATED).send(success("Successfully signed up. Now you can log in."));
    //             })
    //             .catch((err) => {
    //                 console.log(err);
    //                 return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure("Failed to verify"));
    //             });

    //     } catch (error) {
    //         return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
    //     }
    // }


    async signup(req, res) {
        try {
            // Checking if all the properties are valid in the request body
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                logEntry = `${req.url} | status: validation error | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure("Provide information correctly", validation));
            }

            const { name, email, password, confirmPassword, role, age, area, city, country} = req.body;

            if (password != confirmPassword) {
                logEntry = `${req.url} | status: validation error | timestamp: ${new Date().toLocaleString()}\n`;
                logger.addLog(logEntry);
                return res.status(HTTP_STATUS.OK).send(failure("Passwords did not match."));
            }

            const existingUser = await AuthModel.findOne({ email: email })
            // Checking if the user already has an account
            if (existingUser) {
                if (existingUser.verified) {
                    logEntry = `${req.url} | status: signup conflict | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res.status(HTTP_STATUS.OK).send(failure("You have an account, please log in to access."));
                } else {
                    await AuthModel.deleteOne({ email: email, verified: false });
                    await UserModel.deleteOne({ email: email });
                }
            }
            // Creating user instance
            const address = { area, city, country };
            const user = new UserModel({ name, email, role, age, address});
            console.log(user, user.address);
            await user
                .save()
                .then((data) => {
                    console.log("Success")
                })
                .catch((err) => {
                    console.log(err);
                    logEntry = `${req.url} | status: failure | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure("Failed to signup"));
                });


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
                    // Generate a verification token with the user's ID
                    // const verificationToken = data.generateVerificationToken();
                    // // Email the user a unique verification link
                    // const url = `127.0.0.1:8000/auth/verify/${verificationToken}`
                    // transporter.sendMail({
                    //     to: email,
                    //     subject: 'Verify Your Account',
                    //     html: `Click <a href = '${url}'>here</a> to confirm your email.`
                    // })
                    // return res.status(HTTP_STATUS.CREATED).send(success(`Sent a verification email to ${email}`));
                    logEntry = `${req.url} | status: success | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res.status(HTTP_STATUS.CREATED).send(success("Successfully signed up. Now you can log in."));
                })
                .catch((err) => {
                    console.log(err);
                    logEntry = `${req.url} | status: failure | timestamp: ${new Date().toLocaleString()}\n`;
                    logger.addLog(logEntry);
                    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(failure("Failed to signup"));
                });

        } catch (error) {
            logEntry = `${req.url} | status: server error | timestamp: ${new Date().toLocaleString()}\n`;
            logger.addLog(logEntry);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
        }
    }
}

module.exports = new AuthController();