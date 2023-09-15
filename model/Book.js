const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema(
    {
        bookISBN: {
            unique: true,
            type: String,
            required: [true, "Book ISBN is not provided"],
        },
        bookName: {
            type: String,
            required: [true, "Book name is not provided"],
        },
        author: {
            type: String,
            required: [true, "Book author is not provided"],
        },
        genre: {
            type: String,
            required: [true, "Book genre is not provided"],
        },
        price: {
            type: Number,
            default: 0,
        },
        stock: {
            type: Number,
            default: 0,
            min: 1,
            max: 1000,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
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

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;