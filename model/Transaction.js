const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        cart: {
            type: mongoose.Types.ObjectId,
            ref: "Cart",
            required: true,
        },
        user: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
        },
        books: [
            {
                _id: false,
                book: {
                    type: mongoose.Types.ObjectId,
                    ref: "Book",
                    required: true,
                },
                quantity: Number,
                price: Number,
            },
        ],
        total: { type: Number, required: true },
        deliveryDate: {
            type: String,
            default: function () {
                const currentDate = new Date();
                new Date().setDate(currentDate.getDate() + 3);
                return currentDate.toLocaleDateString();
            },
        },
        deliveryStatus: {
            type: Boolean,
            required: true,
            default: false,
        },
        paymentMethod: {
            type: String,
            required: true,
            default: "online",
        },

        // For array of objects
        // Orders: {
        //     type: [
        //         {
        //             orderId: Number,
        //             totalPrice: Number,
        //         }
        //     ]
        // },
    },
    { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
