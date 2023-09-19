const mongoose = require("mongoose");
const moment = require('moment');
const Schema = mongoose.Schema;

const discountSchema = new Schema(
    {

        discountPercentage: {
            type: Number,
            min: 1,
            max: 100,
        },
        discountFrom: {
            type: String,
            // default: moment(new Date()).format('DD-MM-YY HH:mm:ss'),
        },
        discountExp: {
            type: String,
            // default: moment(new Date()).format('DD-MM-YY HH:mm:ss'),
        },

        book: {
            type: mongoose.Types.ObjectId,
            ref: "Book",
            required: true,
        },


    },
    { timestamps: true }
);

const Discount = mongoose.model("Discount", discountSchema);
module.exports = Discount;