const { validationResult } = require("express-validator");
const CartModel = require("../model/Cart");
const BookModel = require("../model/Book");
const UserModel = require("../model/User");
const TransactionModel = require("../model/Transaction");
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");
const { default: mongoose } = require("mongoose");
const { ObjectId } = require("mongodb");
const DiscountModel = require("../model/Discount");
const moment = require('moment');


class Cart {

    async getCart(req, res) {
        try {
            const { userId } = req.params;
            const user = await UserModel.findById({ _id: userId });
            if (!user) {
                return res.status(HTTP_STATUS.NOT_FOUND).send(failure("User does not exist"));
            }
            const cart = await CartModel.findOne({ user: userId }).populate("products.product");
            if (!cart) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .send(failure("Cart does not exist for user"));
            }
            return res.status(HTTP_STATUS.OK).send(success("Successfully got cart for user", cart));
        } catch (error) {
            console.log(error);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error"));
        }
    }

    async addToCart(req, res) {
        try {
            const validation = validationResult(req).array();
            // console.log(validation);
            if (validation.length > 0) {
                //   return res.status(422).send(failure("Invalid properties", validation));
                return res
                    .status(HTTP_STATUS.OK)
                    .send(failure("Failed to add to cart", validation));
            } else {
                const { user, book, quantity } = req.body;
                var userId = new mongoose.Types.ObjectId(user);
                let userRequested = await UserModel.findOne({ _id: userId });
                if (!userRequested) {
                    return res
                        .status(HTTP_STATUS.OK)
                        .send(success("User does not exist"));
                }
                var bookId = new mongoose.Types.ObjectId(book);
                let bookRequested = await BookModel.findOne({ _id: bookId });
                if (!bookRequested) {
                    return res
                        .status(HTTP_STATUS.OK)
                        .send(success("Book does not exist"));
                }
                let cart = await CartModel.findOne({
                    user: user,
                    checkoutStatus: false,
                });
                if (!cart) {
                    // If no cart exists, create a new one
                    cart = await CartModel({ user, books: [] });
                }

                // console.log(cart[0]);
                console.log(cart.books);
                let flag = false;

                cart.books.forEach(function (data, index, jsonData) {
                    if (data.book == book) {
                        flag = true;
                        console.log(data.quantity);
                        var newQuantity = data.quantity + quantity;
                        if (bookRequested.stock < newQuantity) {
                            return res
                                .status(HTTP_STATUS.OK)
                                .send(success("Book stock exceeded"));
                        }
                        data.quantity = newQuantity;
                    }
                });
                let calculatedPrice = Number(bookRequested.price);
                if (!flag) {
                    if (bookRequested.stock < quantity) {
                        return res
                            .status(HTTP_STATUS.OK)
                            .send(success("Book stock exceeded"));
                    }

                    // const dateNow = new Date();
                    const discountRequested = await DiscountModel.findOne({
                        book: book
                    });
                    console.log(discountRequested);
                    if (discountRequested) {
                        const dateNowFormatted = moment(new Date()).format('DD-MM-YY HH:mm:ss');
                        const dateNow = moment(dateNowFormatted, 'DD-MM-YY HH:mm:ss').toDate();
                        const dateFrom = moment(discountRequested.discountFrom, 'DD-MM-YY HH:mm:ss').toDate();
                        const dateExp = moment(discountRequested.discountExp, 'DD-MM-YY HH:mm:ss').toDate();
                        console.log(dateNow, dateFrom, dateExp);
                        if ((dateNow > dateFrom) && (dateNow < dateExp)) {
                            console.log("executing here");
                            const discounted = (calculatedPrice / 100) * Number(discountRequested.discountPercentage);
                            calculatedPrice = calculatedPrice - discounted;
                        }
                    }
                    cart.books.push({
                        book,
                        quantity,
                        price: calculatedPrice,
                    });
                }
                let bookPrice = calculatedPrice * Number(quantity);
                cart.total = bookPrice + cart.total;

                await cart
                    .save()
                    .then((data) => {
                        return res
                            .status(HTTP_STATUS.CREATED)
                            .send(success("Successfully added to cart", data));
                    })
                    .catch((err) => {
                        console.log(err);
                        return res
                            .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
                            .send(failure("Failed to add to cart"));
                    });
            }
        } catch (error) {
            console.log(error);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error from add-to-cart"));
        }
    }

    async removeFromCart(req, res) {
        try {
            const validation = validationResult(req).array();
            // console.log(validation);
            if (validation.length > 0) {
                //   return res.status(422).send(failure("Invalid properties", validation));
                return res
                    .status(HTTP_STATUS.OK)
                    .send(failure("Failed to remove from cart", validation));
            } else {
                const { user, book, quantity } = req.body;

                let cart = await CartModel.findOne({ user: user });
                if (!cart) {
                    return res
                        .status(HTTP_STATUS.OK)
                        .send(success("No cart exists for the user"));
                }
                // console.log(cart[0]);
                console.log(cart.books);
                let flag = false;
                cart.books.forEach(function (data, index, jsonData) {
                    if (data.book == book) {
                        flag = true;
                        console.log(data.quantity);
                        if (data.quantity <= quantity) {
                            data.quantity = 0;
                            cart.books = cart.books.filter(
                                (item) => item.book.toString() !== book.toString()
                            );
                        } else {
                            var newQuantity = data.quantity - quantity;
                            data.quantity = newQuantity;
                        }
                    }
                });

                if (!flag) {
                    return res
                        .status(HTTP_STATUS.OK)
                        .send(success("This book does not exist in the cart"));
                }

                await cart
                    .save()
                    .then((data) => {
                        return res
                            .status(HTTP_STATUS.ACCEPTED)
                            .send(success("Successfully removed from cart", data));
                    })
                    .catch((err) => {
                        console.log(err);
                        return res
                            .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
                            .send(failure("Failed to remove from cart"));
                    });
            }
        } catch (error) {
            console.log(error);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error from remove-from-cart"));
        }
    }

    async checkoutCart(req, res) {
        try {
            const validation = validationResult(req).array();
            // console.log(validation);
            if (validation.length > 0) {
                //   return res.status(422).send(failure("Invalid properties", validation));
                return res
                    .status(HTTP_STATUS.OK)
                    .send(failure("Failed to add the transaction", validation));
            } else {
                const { cartId } = req.body;
                const cart = await CartModel.findOne({ _id: cartId });

                if (!cart) {
                    return res
                        .status(HTTP_STATUS.NOT_FOUND)
                        .send(failure("Cart was not found for this user"));
                }
                if (cart.checkoutStatus) {
                    cart.toObject;
                    delete cart.checkoutStatus;
                    return res
                        .status(HTTP_STATUS.OK)
                        .send(success("Cart has already been checked out", cart));
                }
                const user = await UserModel.findOne({ _id: cart.user });
                if (cart.total > user.balance) {
                    return res
                        .status(HTTP_STATUS.OK)
                        .send(success("Insufficient balance", cart));
                }
                const booksList = cart.books.map((element) => {
                    return element.book;
                });

                const booksInCart = await BookModel.find({
                    _id: {
                        $in: booksList,
                    },
                });

                if (booksList.length !== booksInCart.length) {
                    return res
                        .status(HTTP_STATUS.NOT_FOUND)
                        .send(failure("All products in cart do not exist"));
                }


                booksInCart.forEach((book) => {
                    const bookFound = cart.books.findIndex(
                        (cartItem) => String(cartItem.book._id) === String(book._id)
                    );
                    if (book.stock < cart.books[bookFound].quantity) {
                        return res
                            .status(HTTP_STATUS.NOT_FOUND)
                            .send(
                                failure(
                                    "Unable to check out at this time, product does not exist"
                                )
                            );
                    }
                    book.stock -= cart.books[bookFound].quantity;
                });

                const bulk = [];
                booksInCart.map((element) => {
                    bulk.push({
                        updateOne: {
                            filter: { _id: element },
                            update: { $set: { stock: element.stock } },
                        },
                    });
                });

                const stockSave = await BookModel.bulkWrite(bulk);
                const newTransaction = await TransactionModel.create({
                    cart: cartId,
                    books: cart.books,
                    user: cart.user,
                    total: cart.total,
                });

                cart.checkoutStatus = 1;
                const cartSave = await cart.save();

                if (cartSave && stockSave && newTransaction) {
                    return res
                        .status(HTTP_STATUS.OK)
                        .send(success("Successfully checked out!", cartSave));
                }

                return res.status(HTTP_STATUS.OK).send(failure("Something went wrong"));
            }
        } catch (error) {
            console.log(error);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error from checkout-cart"));
        }
    }
}

module.exports = new Cart();
