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
            min: 1,
        },
        stock: {
            type: Number,
            default: 0,
            min: 1,
            max: 1000,
        },
        rating: {
            type: Number,
            default: 0,
            min: 1,
            max: 5,
        },
        discount: [
            {
                discountPercentage: {
                    type: Number,
                    default: 0,
                    min: 1,
                    max: 100,
                },
                discountFrom: {
                    type: Date,
                    default: moment(new Date()).format('DD-MM-YY HH:mm:ss'),
                },
                discountTill: {
                    type: Date,
                },
            },
        ],

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