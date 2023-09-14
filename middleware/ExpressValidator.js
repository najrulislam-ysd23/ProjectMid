const { body, query } = require("express-validator");

const validator = {

    signup: [
        body("email")
            .isLength({ min: 1 })
            .trim()
            .withMessage("Enter email")
            .bail()
            .isEmail()
            .withMessage("Enter a valid email")
            .bail(),
        body("password")
            .exists()
            .bail()
            .withMessage("Enter a password")
            .isStrongPassword({
                minLength: 8,
                minUppercase: 1,
                minLowercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage(
                "Password should be 8 characters long and it should contain uppercase, lowercase, number and a special character."
            ),
        body("confirmPassword")
            .exists()
            .bail()
            .withMessage("Confirm your password"),
        body("role").custom((value, { req, res }) => {
            if (value) {
                if (
                    !(value === "admin" || value === "customer")
                ) {
                    throw new Error("Invalid role input");
                }
            }
            return true;
        }),
        body("name")
            .exists()
            .withMessage("Name must be specified")
            .bail()
            .isString()
            .withMessage("Name have to be a string")
            .bail()
            .custom((value, { req, res }) => {
                console.log(value);
                if (value.length <= 0) {
                    throw new Error("Name cannot be blank");
                }
                return true;
            }),
        body("age")
            .exists()
            .withMessage("Age must be specified")
            .bail()
            .isNumeric()
            .withMessage("Enter a valid age")
            .custom((value, { req, res }) => {
                if (value < 18) {
                    throw new Error("You do not meet the minimum age requirement");
                } else if (value > 120) {
                    throw new Error("Are you still alive for real?");
                }
                return true;
            }),
        body("area")
            .exists()
            .withMessage("Area must be specified")
            .bail()
            .isString()
            .withMessage("Area have to be a string")
            .bail(),
        body("city")
            .exists()
            .withMessage("City must be specified")
            .bail()
            .isString()
            .withMessage("City have to be a string")
            .bail(),
        body("country")
            .exists()
            .withMessage("Country must be specified")
            .bail()
            .isString()
            .withMessage("Country have to be a string")
            .bail(),
    ],

    login: [
        body("email")
            .isLength({ min: 1 })
            .trim()
            .withMessage("Enter email")
            .bail()
            .isEmail()
            .withMessage("Enter a valid email")
            .bail(),
        body("password").exists().bail().withMessage("Enter password"),
    ],

    createUser: [
        body("name")
            .exists()
            .withMessage("Name must be specified")
            .bail()
            .isString()
            .withMessage("Name have to be a string")
            .bail()
            .custom((value, { req, res }) => {
                console.log(value);
                if (value.length <= 0) {
                    throw new Error("Name cannot be blank");
                }
                return true;
            }),
        body("email")
            .isLength({ min: 1 })
            .trim()
            .withMessage("Email must be specified")
            .bail()
            .isEmail()
            .withMessage("Enter a valid email")
            .bail(),
        body("role").custom((value, { req, res }) => {
            if (value) {
                if (
                    !(value === "admin" || value === "customer" || value === "supplier")
                ) {
                    throw new Error("Invalid role input");
                }
            }
            return true;
        }),
        body("age")
            .exists()
            .withMessage("Age must be specified")
            .bail()
            .isNumeric()
            .withMessage("Enter a valid age")
            .custom((value, { req, res }) => {
                if (value < 18) {
                    throw new Error("You do not meet the minimum age requirement");
                } else if (value > 120) {
                    throw new Error("Are you still alive for real?");
                }
                return true;
            }),
        body("address")
            .exists()
            .withMessage("Address must be specified")
            .bail()
            .isString()
            .withMessage("Address have to be a string")
            .bail(),
    ],




};

module.exports = validator;