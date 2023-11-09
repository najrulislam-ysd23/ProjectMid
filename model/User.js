const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is not provided"],
        maximumLength: 30,
    },
    email: {
        unique: true,
        type: String,
        required: [true, "Email is not provided"],
        maximumLength: 30,
    },
    role: {
        type: String,
        required: false,
        default: "customer",
        enum: ['admin', 'customer'],
    },
    age: {
        type: Number,
        required: true,
        min: 18,
        max: 120,
    },
    address: {
        area: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
    },
    balance: {
        type: Number,
        default: 0,
        min: 0,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
},
    { timestamps: true },
);

const User = mongoose.model("User", userSchema);
module.exports = User;