const { validationResult } = require("express-validator");
const TransactionModel = require("../model/Transaction");
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");

class Transaction {
    async getAll(req, res) {
        try {
            const transactions = await TransactionModel.find({})
                .populate("user", "name")
                // .populate("books.bookISBN")
                .populate("books.book");
            console.log(transactions);
            if (transactions.length > 0) {
                return res.status(HTTP_STATUS.OK).send(
                    success("Successfully got all the transactions", {
                        transactions,
                        total: transactions.length,
                    })
                );
            } else {
                return res.status(HTTP_STATUS.OK).send(success("No transactions were found"));
            }
        } catch (error) {
            console.log(error);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error from getAll"));
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const transaction = await TransactionModel.findOne({ _id: id })
                .populate("user", "name")
                .populate("books.book");
            console.log(transaction);

            const transactedBooks = transaction.books;
            console.log(transactedBooks);
            var priceArr = [];
            transactedBooks.forEach(function (data, index, jsonData) {
                priceArr.push(data.book.price * data.quantity);
            });
            const totalPrice = priceArr.reduce(
                (total, current) => total + current,
                0
            );
            console.log(totalPrice);
            const dummyTotal = { "Total price": totalPrice };
            console.log(dummyTotal);

            // const updatedTransaction = {...transactedBooks, ...dummyTotal};
            const updatedTransaction = { ...transaction._doc, ...dummyTotal };
            console.log(updatedTransaction);
            if (updatedTransaction) {
                return res
                    .status(HTTP_STATUS.OK)
                    .send(success("Successfully received the transaction", updatedTransaction));
            } else {
                return res
                    .status(HTTP_STATUS.OK)
                    .send(failure("Failed to received the transaction"));
            }
        } catch (error) {
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error from getById"));
        }
    }


    //   async create(req, res) {
    //     try {
    //       const { userId, cartId } = req.body;
    //       const cart = await CartModel.findOne({ _id: cartId, user: userId });

    //       if (!cart) {
    //         return res
    //           .status(HTTP_STATUS.NOT_FOUND)
    //           .send(failure("Cart was not found for this user"));
    //       }
    //       const productsList = cart.products.map((element) => {
    //         return element.product;
    //       });

    //       const productsInCart = await ProductModel.find({
    //         _id: {
    //           $in: productsList,
    //         },
    //       });

    //       if (productsList.length !== productsInCart.length) {
    //         return res
    //           .status(HTTP_STATUS.NOT_FOUND)
    //           .send(failure("All products in cart do not exist"));
    //       }

    //       productsInCart.forEach((product) => {
    //         const productFound = cart.products.findIndex(
    //           (cartItem) => String(cartItem.product._id) === String(product._id)
    //         );
    //         if (product.stock < cart.products[productFound].quantity) {
    //           return res
    //             .status(HTTP_STATUS.NOT_FOUND)
    //             .send(
    //               failure(
    //                 "Unable to check out at this time, product does not exist"
    //               )
    //             );
    //         }
    //         product.stock -= cart.products[productFound].quantity;
    //       });

    //       const bulk = [];
    //       productsInCart.map((element) => {
    //         bulk.push({
    //           updateOne: {
    //             filter: { _id: element },
    //             update: { $set: { stock: element.stock } },
    //           },
    //         });
    //       });

    //       const stockSave = await ProductModel.bulkWrite(bulk);
    //       const newTransaction = await TransactionModel.create({
    //         products: cart.products,
    //         user: userId,
    //         total: cart.total,
    //       });

    //       cart.products = [];
    //       cart.total = 0;
    //       const cartSave = await cart.save();

    //       if (cartSave && stockSave && newTransaction) {
    //         return res
    //           .status(HTTP_STATUS.OK)
    //           .send(success("Successfully checked out!", newTransaction));
    //       }

    //       return res.status(HTTP_STATUS.OK).send(failure("Something went wrong"));
    //     } catch (error) {
    //       console.log(error);
    //       return res
    //         .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    //         .send(failure("Internal server error"));
    //     }
    //   }
}

module.exports = new Transaction();
