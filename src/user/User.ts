import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { isStrongPassword, isEmail } from "validator";

export default interface User extends Document{
    name: string
    surname: string
    initials: string
    email: string
    password: string
    signature: Buffer
    validated: Boolean
    validateCode: string
    tokens: Object[]
}

/**
 * <p>
 * Schema that defines the User entity and it used to
 * create the Mongoose Model of the same name
 * Options objects for the properties are used to validate their respective properties
 * <p>
 * @param Object definition object containing the properties and their options used to create the Schema
 */
const userSchema = new Schema<User>({
    name: {type: String, required: true},
    surname: {type: String, required: true},
    initials: {type: String, required: true},
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        unique: true,
        validate: {
            validator: value => {
                //return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value);
                return isEmail(value);
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: value => {
                // return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/.test(value);
                return isStrongPassword(value);
            }
        }
    },
    signature: {type: String, required: true },
    validated: {type: Boolean, default: false},
    tokenDate: {type: Date, default: Date.now},
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

/**
 * @function This function is called automatically  before the save function is called is called for a user.
 * It handles the process of salting and hashing a user password and sets the user's password to the
 * generated hash.
 */

userSchema.pre("save", async function(next)  {
    const usr = this;
    if(this.isModified("password") || this.isNew){
        //Salt is automatically generated:
        bcrypt.hash(usr.password, process.env.SALT_ROUNDS)
            .then(async (hash) => {
                usr.password = hash;
                await usr.save();
                next();
            })
            .catch((err) => {
                throw err;
            })
    }
    if(this.isModified("signature") || this.isNew){

    }
    return next();
});

userSchema.methods.genAuthToken = async function() {
    const token = jwt.sign({_id: this._id.toString()}, process.env.SECRET);
    this.tokens = this.tokens.concat({token});
    await this.save();
    return token;
}

export const UserModel = model<User>('User', userSchema);

/*
*  bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS), (saltErr,salt) => {
            if(saltErr) {
                throw saltErr;
            } else {
                bcrypt.hash(usr.password, salt, (hashErr,_hash) => {
                    if(hashErr) return next(hashErr);
                    usr.password = _hash;
                    next();
                })
            }
        });*/