const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
    {
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
        total: { type: Number, required: true, default: 0 },
        checkoutStatus: { type: Number, required: true, default: 0 },
        deliveryDate: {
            type: String,
            default: function () {
                const currentDate = new Date();
                currentDate.setDate(currentDate.getDate() + 3);
                return currentDate.toLocaleDateString();
            },
        },
    },
    { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
