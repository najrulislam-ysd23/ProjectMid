const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const authSchema = new Schema({
    // email, password, role, verified, user(ref)
    email: {
        unique: true,
        type: String,
        required: [true, "Email is not provided"],
        maximumLength: 30,
    },
    password: {
        type: String,
        required: [true, "Password is not provided"],
        minimumLength: 8,
    },
    role: {
        type: String,
        required: false,
        default: "customer",
        enum: ['admin', 'customer'],
    },
    verified: {
        type: Boolean,
        default: 0,
        required: false,
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
},
    { timestamps: true, },
);

const Auth = mongoose.model("Auth", authSchema);
module.exports = Auth;