const mongoose = require("mongoose");
const moment = require('moment');
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
        description: {
            type: String,
            required: [true, "Description is not provided"],
        },
        author: {
            type: String,
            required: [true, "Book author not provided"],
        },
        genre: {
            type: String,
            required: [true, "Book genre is not provided"],
        },
        price: {
            type: Number,
            required: [true, "Book price is not provided"],
            min: 1,
        },
        stock: {
            type: Number,
            default:0,
            min: 0,
            max: 1000,
        },
        rating: {
            type: Number,
            default:0,
            min: 0,
            max: 5,
        },
        ratingCount: {
            type: Number,
            default:0,
            min: 0,
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