const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    initials: { type: String, required: true},
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
    password: { type: String, required: true },
    // signature: { type: String, required: true },
    phone: {type: String, required: true},
    validated: { type: Boolean, default: false },
    tokenDate: { type: Date, default: Date.now }
});

userSchema.pre("save", function(next)  {  //Cannot use lexical notation here (see: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions")
    const usr = this;
    console.log(this);
    if(this.isModified("password") || this.isNew){
        bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS), (saltErr,salt) => {
            if(saltErr) {
                throw saltErr;
            } else {
                bcrypt.hash(usr.password, salt, (hashErr,_hash) => {
                    if(hashErr) return next(hashErr);
                    usr.password = _hash;
                    next();
                })
            }
        });
    } else {
        return next();
    }
});

module.exports = mongoose.model('User', userSchema);