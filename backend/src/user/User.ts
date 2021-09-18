import { Schema, model } from 'mongoose';
import { isStrongPassword, isEmail } from "validator";
import { IUser, privilegeLevel } from "./IUser";

/**
 * <p>
 * Schema that defines the User entity and it used to
 * create the Mongoose Model of the same name
 * Options objects for the properties are used to validate their respective properties
 * <p>
 * @param Object definition object containing the properties and their options used to create the Schema
 */

export const userSchema = new Schema<IUser>({
    name: { type: String, required: [true, "Name is a required field"]},
    surname: { type: String, required: [true, "Surname is a required field"] },
    initials: { type: String, required: [true, "Initials is a required field"]},
    email: {
        type: String,
        required: [true, "Email is a required field"],
        trim: true,
        lowercase: true,
        unique: true,
        validate: {
            validator: value => {
                return isEmail(value);
            },
            message: props => `${props.value} is not a valid email`
        }
    },
    password: {
        type: String,
        required: [true, "Password is a required field"],
        validate: {
            validator: value => {
                return isStrongPassword(value);
            },
            message: 'Password is too weak'
        }
    },
    signature: { type: Schema.Types.Buffer, required: [true, "A signature is required"] },
    validated: { type: Boolean, default: false },
    validateCode: { type: String, required: true },
    contacts: [{
        type: String,
        required: false,
        validate: {
            validator: function(value) {
                return this.email != value;
            },
            message: "You can't be your own friend!"
        }
    }],
    antiCSRFToken: { type: String, default: ''},
    csrfTokenTime: { type: Number },
    contactRequests: [{ type: String, required: false, maxlength: [ parseInt(process.env.MAX_CONTACT_REQUESTS) || 50, "Request limit reached" ]}],
    blockedList: [{ type: String, required: false, maxlength: [ parseInt(process.env.MAX_BLOCKLIST) || 50, "Blocked list is at capacity" ]}],
    privilegeLevel: { type: String, required: false, immutable: true, default: privilegeLevel.USER },
    ownedWorkflows: [{type: String, required: false, maxlength: [ parseInt(process.env.MAX_OWNED_WORKFLOWS) || 50, "Workflow limit reached" ]}],
    workflows: [{type: String, required: false, maxlength: [ parseInt(process.env.MAX_WORKFLOWS) || 500, "This user cannot be a part of further workflows" ]}],
    workflowTemplates: [{type: String, required: false, maxlength: [ parseInt(process.env.MAX_WORKFLOW_TEMPLATES) || 50, "Workflow template limit reached" ]}]
});

export const User = model<IUser>('User', userSchema);