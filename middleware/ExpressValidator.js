const { body, query } = require("express-validator");
const moment = require('moment');


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
        body("balance")
            .custom((value, { req, res }) => {
                if (value < 0) {
                    throw new Error("Balance should be positive");
                } else if (value > 50000) {
                    throw new Error("Can not add more than 50000 at once");
                }
                return true;
            }),
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
        body("password")
            .exists()
            .withMessage("Enter password")
            .bail(),
    ],

    isValidEmail: [
        body("email")
            .exists()
            .withMessage("Enter email of the user to delete")
            .bail()
            .isEmail()
            .withMessage("Enter a valid email")
    ],

    isValidUser: [
        body("user")
            .exists()
            .withMessage("Enter user id of the user")
            .bail()
            .isString()
            .withMessage("Enter a valid user"),
    ],

    isValidBook: [
        body("book")
            .exists()
            .withMessage("Enter book id to delete")
            .bail()
            .isString()
            .withMessage("Enter valid book id")
    ],

    createBook: [
        body("bookISBN")
            .isLength({ min: 1 })
            .trim()
            .withMessage("Book ISBN must be specified")
            .bail()
            .isLength({ min: 13 })
            .withMessage("Book ISBN must be 13 characters long")
            .bail()
            .isLength({ max: 13 })
            .withMessage("Book ISBN must be 13 characters long"),
        body("bookName")
            .exists()
            .withMessage("Book name must be specified")
            .bail()
            .isString()
            .withMessage("Book name have to be a string")
            .bail()
            .isLength({ min: 1 })
            .withMessage("Book title must be at least 1 characters long")
            .bail()
            .isLength({ max: 100 })
            .withMessage("Book title can be maximum 100 characters long")
            .bail()
            .custom((value, { req, res }) => {
                console.log(value);
                if (value.length <= 0) {
                    throw new Error("Book name cannot be blank");
                }
                return true;
            }),
        body("description")
            .exists()
            .withMessage("Book description must be provided")
            .bail()
            .isString()
            .withMessage("Book description must be a string")
            .bail()
            .isLength({ min: 30 })
            .withMessage("Book description must be at least 30 characters long")
            .bail()
            .isLength({ max: 500 })
            .withMessage("Book description can be maximum 500 characters long"),
        body("author")
            .exists()
            .withMessage("Book name must be specified")
            .bail()
            .isString()
            .withMessage("Book author must be a string")
            .bail()
            .isLength({ min: 1 })
            .withMessage("Book author must be at least 1 characters long")
            .bail()
            .isLength({ max: 50 })
            .withMessage("Book author can be maximum 50 characters long"),
        body("genre")
            .exists()
            .withMessage("Book genre must be specified")
            .bail()
            .isString()
            .withMessage("Book genre must be a string")
            .bail()
            .isLength({ min: 1 })
            .withMessage("Book genre must be at least 1 characters long")
            .bail()
            .isLength({ max: 100 })
            .withMessage("Book genre can be maximum 100 characters long"),
        body("price")
            .exists()
            .withMessage("Book price must be specified")
            .bail()
            .isNumeric()
            .withMessage("Book price must be number"),
        body("stock")
            .exists()
            .withMessage("Book stock must be specified")
            .bail()
            .isNumeric()
            .withMessage("Book stock must be number"),

    ],

    getUsersQuery: [
        query("page").custom((value, { req, res }) => {
            if (value) {
                if (isNaN(Number(value))) {
                    throw new Error("Page have to be a number");
                }
            }
            return true;
        }),
        query("limit").custom((value, { req, res }) => {
            if (value) {
                if (isNaN(Number(value))) {
                    throw new Error("Limit have to be a number");
                }
            }
            return true;
        }),

        query("age").custom((value, { req, res }) => {
            if (value) {
                if (isNaN(Number(value))) {
                    throw new Error("Stock have to be a number");
                }
            }
            return true;
        }),

        query("ageCriteria").custom((value, { req, res }) => {
            if (value) {
                if (
                    !(
                        value === "gt" ||
                        value === "gte" ||
                        value === "lt" ||
                        value === "lte" ||
                        value === "eq" ||
                        value === "ne"
                    )
                ) {
                    throw new Error("Enter a criteria for stock");
                }
            }
            return true;
        }),
    ],

    addDiscount: [
        body("book")
            .exists()
            .withMessage("Specify book id")
            .bail()
            .isString()
            .withMessage("Book id has to be a string"),
        body("discountPercentage")
            .exists()
            .withMessage("Specify discount percentage")
            .bail()
            .isNumeric()
            .withMessage("Discount Percentage must be a number")
            .bail()
            .custom((value, { req, res }) => {
                if (value < 0 || value > 100) {
                    throw new Error("Enter valid discount percentage");
                }
                return true;
            }),
        body("discountFrom")
            .custom((value, { req, res }) => {
                if (value) {
                    if (!(moment(value, 'DD-MM-YY HH:mm:ss', true).isValid())) {
                        throw new Error('Discount From must be in the format "DD-MM-YY HH:mm:ss"');
                    }
                }
                return true;
            }),
        body("discountExp")
            .exists()
            .withMessage("Specify expiration date for discount")
            .bail()
            .custom((value, { req, res }) => {
                if (value) {
                    if (!(moment(value, 'DD-MM-YY HH:mm:ss', true).isValid())) {
                        throw new Error('Discount Expiration must be in the format "DD-MM-YY HH:mm:ss"');
                    }
                }
                return true;
            }),
    ],


    booksQuery: [
        query("page").custom((value, { req, res }) => {
            if (value) {
                if (isNaN(Number(value))) {
                    throw new Error("Page have to be a number");
                }
            }
            return true;
        }),
        query("limit").custom((value, { req, res }) => {
            if (value) {
                if (isNaN(Number(value))) {
                    throw new Error("Limit have to be a number");
                }
            }
            return true;
        }),

        query("author").custom((value, { req, res }) => {
            if (value) {
                if (!/^[A-Za-z]*[.]*[A-Za-z]*$/.test(value)) {
                    throw new Error("Author must contain only alphabetic characters (periods are optional)");
                }
            }
            return true;
        }),

        query("genre").custom((value, { req, res }) => {
            if (value) {
                if (typeof value != 'string') {
                    throw new Error("Genre have to be string");
                }
            }
            return true;
        }),

        query("price").custom((value, { req, res }) => {
            if (value) {
                if (isNaN(Number(value))) {
                    throw new Error("Price have to be a number");
                }
            }
            return true;
        }),
        query("rating").custom((value, { req, res }) => {
            if (value) {
                if (isNaN(Number(value))) {
                    throw new Error("Rating have to be a number");
                }
            }
            return true;
        }),
        query("stock").custom((value, { req, res }) => {
            if (value) {
                if (isNaN(Number(value))) {
                    throw new Error("Stock have to be a number");
                }
            }
            return true;
        }),

        query("priceCriteria").custom((value, { req, res }) => {
            if (value) {
                if (
                    !(
                        value === "gt" ||
                        value === "gte" ||
                        value === "lt" ||
                        value === "lte" ||
                        value === "eq" ||
                        value === "ne"
                    )
                ) {
                    throw new Error("Enter a criteria for price");
                }
            }
            return true;
        }),
        query("ratingCriteria").custom((value, { req, res }) => {
            if (value) {
                if (
                    !(
                        value === "gt" ||
                        value === "gte" ||
                        value === "lt" ||
                        value === "lte" ||
                        value === "eq" ||
                        value === "ne"
                    )
                ) {
                    throw new Error("Enter a criteria for rating");
                }
            }
            return true;
        }),
        query("stockCriteria").custom((value, { req, res }) => {
            if (value) {
                if (
                    !(
                        value === "gt" ||
                        value === "gte" ||
                        value === "lt" ||
                        value === "lte" ||
                        value === "eq" ||
                        value === "ne"
                    )
                ) {
                    throw new Error("Enter a criteria for stock");
                }
            }
            return true;
        }),
    ],

    updateBook: [
        body("bookName")
            .custom((value, { req, res }) => {
                if (value) {
                    if (!/^[A-Za-z]*[.]*[A-Za-z]*$/.test(value)) {
                        throw new Error("Book name must contain only alphabetic characters (periods are optional)");
                    } else if (value.length <= 0) {
                        throw new Error("Book name cannot be blank");
                    }
                }
                return true;
            }),
        body("description")
            .custom((value, { req, res }) => {
                if (value) {
                    if (!/^[A-Za-z]*[.]*[A-Za-z]*$/.test(value)) {
                        throw new Error("Book description must contain only alphabetic characters (periods are optional)");
                    } else if (value.length < 30 && value.length>100) {
                        throw new Error("Book description must be at between 30-100 characters long");
                    }
                }
                return true;
            }),
        body("author")
            .custom((value, { req, res }) => {
                if (value) {
                    if (!/^[A-Za-z]*[.]*[A-Za-z]*$/.test(value)) {
                        throw new Error("Book author must contain only alphabetic characters (periods are optional)");
                    } else if (value.length < 1 && value.length>50) {
                        throw new Error("Book author must be at between 1-50 characters long");
                    }
                }
                return true;
            }),
        body("genre")
            .custom((value, { req, res }) => {
                if (value) {
                    if (!/^[A-Za-z]*[.]*[A-Za-z]*$/.test(value)) {
                        throw new Error("Book genre must contain only alphabetic characters (periods are optional)");
                    } else if (value.length < 1 && value.length>50) {
                        throw new Error("Book genre must be at between 1-50 characters long");
                    }
                }
                return true;
            }),
        body("price")
            .custom((value, { req, res }) => {
                if (value) {
                    console.log("value of price",value);
                    if (isNaN(value)) {
                        throw new Error("Price have to be a number");
                    }
                    if(value !== undefined && value < 0) {
                        throw new Error("Price can not be negative");
                    }
                }
                return true;
            }),
        body("stockInc")
            .custom((value, { req, res }) => {
                if (value) {
                    if (isNaN(value)) {
                        throw new Error("StockInc have to be a number");
                    }
                    if(value !== undefined && value < 0) {
                        throw new Error("StockInc value can not be negative");
                    }
                }
                return true;
            }),
        body("stockDec")
            .custom((value, { req, res }) => {
                if (value) {
                    if (isNaN(value)) {
                        throw new Error("StockDec have to be a number");
                    }
                    if(value !== undefined && value < 0) {
                        throw new Error("StockDec value can not be negative");
                    }
                }
                return true;
            }),
    ],



    cart: [
        body("user").isString().withMessage("User has to be a string"),
        body("book").isString().withMessage("Book has to be a string"),
        body("quantity").custom((value, { req, res }) => {
            if (value) {
                if (isNaN(Number(value))) {
                    throw new Error("Stock have to be a number");
                }
            }
            return true;
        }),
    ],
    checkoutCart: [
        body("cartId").isString().withMessage("cartId has to be a string"),
    ],

    getReview: [
        body("book")
            .exists()
            .withMessage("Enter book id to review")
            .bail()
            .isString()
            .withMessage("Enter valid book id"),
    ],

    addReview: [
        body("user")
            .exists()
            .withMessage("Enter user id to review")
            .bail()
            .isString()
            .withMessage("Enter valid user id"),
        body("book")
            .exists()
            .withMessage("Enter book id to review")
            .bail()
            .isString()
            .withMessage("Enter valid book id"),
        body("rating")
            .exists()
            .withMessage("Enter rating for book")
            .bail()
            .isNumeric()
            .withMessage("Rating should be a number")
            .bail()
            .isInt({ min: 1, max: 5 })
            .withMessage("Rating should be between 1 to 5"),
        body("review")
            .custom((value, { req, res }) => {
                if (value) {
                    if (!value || typeof value !== 'string' || value.trim().length === 0) {
                        throw new Error("Review must be a non-empty string");
                    } else if (value.length < 1 || value.length > 100) {
                    throw new Error("Review must be between 1 and 100 characters long");
                }
                }
                return true;
            }),
    ],

    updateReview: [
        body("user")
            .exists()
            .withMessage("Enter user id to review")
            .bail()
            .isString()
            .withMessage("Enter valid user id"),
        body("book")
            .exists()
            .withMessage("Enter book id to review")
            .bail()
            .isString()
            .withMessage("Enter valid book id"),
        body("rating")
            .not()
            .exists()
            .withMessage("You can not update rating"),
        body("review")
            .isString()
            .withMessage("Enter valid review")
            .bail()
            .isLength({ max: 100 })
            .withMessage("Review can not exceed 100 character"),
    ],



};

module.exports = validator;