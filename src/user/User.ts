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

export const PrivilegeLevel = Object.freeze({ADMIN: "Admin", USER: "User"});

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
    antiCSRFToken: Type.string({default: ''}),
    csrfTokenTime: Type.number(),
    contacts: Type.array({required: false}).of(Type.string()),
    contactRequests: Type.array({required: false}).of(Type.string()),
    blockedList: Type.array({required: false}).of(Type.string()),
    privilegeLevel: Type.string({ default: PrivilegeLevel.USER }),
    ownedWorkflows: [String],
    workflows: [String],
    workflowTemplates: [String]

});

export const User = typedModel('User', userSchema);
export type UserDoc = ExtractDoc<typeof userSchema>;
export type UserProps = ExtractProps<typeof userSchema>;