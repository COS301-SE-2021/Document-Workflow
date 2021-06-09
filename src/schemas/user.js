const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


/**
 * The schema for a user. Since we are making use of NoSQL, this in essence defines the structure
 * of what our user entries in the database look like. It also validates whether or not a user's email
 * and password are valid.
 * A password is valid iff it contains an uppercase,lowercase annd special character as well as being 8 characters long.
 * //TODO: add signature to this list.
 */
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
    password: { type: String,
        required: true,
        validate: {
            validator: value => {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/.test(value);
            }
        }
    },
    // signature: { type: String, required: true },
    validated: { type: Boolean, default: false },
    tokenDate: { type: Date, default: Date.now },
    signature: {type: Buffer}
});

/**
 * This function is called automatically  before the save function is called is called for a user.
 * It handles the process of salting and hashing a user password and sets the user's password to the
 * generated hash.
 */
userSchema.pre("save", function(next)  {  //Cannot use lexical notation here (see: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions")
    const usr = this;
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