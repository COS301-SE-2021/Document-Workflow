const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    userName: { type: String, required: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: {
        type: String,
        required: [ true, "Email is required" ],
        trim: true,
        lowercase: true,
        unique: true,
        validate: {
            validator: value => {
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value);
            }
        }
    },
    hash: { type: String, required: true },
    signature: { type: String, required: true },
    phone: { type: String, required: true },
    validated: { type: Boolean, default: false },
    tokenDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);