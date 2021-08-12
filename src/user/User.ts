import {
    createSchema,
    Type,
    typedModel,
    ExtractDoc,
    ExtractProps
} from "ts-mongoose";
import { isStrongPassword, isEmail } from "validator";

/**
 * <p>
 * Schema that defines the User entity and it used to
 * create the Mongoose Model of the same name
 * Options objects for the properties are used to validate their respective properties
 * <p>
 * @param Object definition object containing the properties and their options used to create the Schema
 */
const tokenSchema = createSchema({
    token: Type.string({required: true})
}, { _id: false, _v: false });

export const userSchema = createSchema({
    name: Type.string({required: true}),
    surname: Type.string({type: String, required: true}),
    initials: Type.string({type: String, required: true}),
    email: Type.string({
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate: {
            validator: value => {
                return isEmail(value);
            }
        }
    }),
    password: Type.string({
        required: true,
        validate: {
            validator: value => {
                return isStrongPassword(value);
            }
        }
    }),
    signature: Type.buffer({required: true }),
    validated: Type.boolean({ default: false }),
    validateCode: Type.string(),
    tokens: Type.array().of(tokenSchema),
    ownedWorkflows: [{type:String}],
    workflows: [{type: String}]
});

export const User = typedModel('User', userSchema);
export type UserDoc = ExtractDoc<typeof userSchema>;
export type UserProps = ExtractProps<typeof userSchema>;
export type Token = ExtractProps<typeof tokenSchema>;