import { Types } from "mongoose";
type ObjectId = Types.ObjectId;

export const privilegeLevel = Object.freeze({ADMIN: "Admin", USER: "User"});

export interface IUser {
    _id?: ObjectId,
    name: string,
    surname: string,
    initials: string,
    email: string,
    password: string,
    signature: Types.Buffer,
    validated: boolean,
    validateCode: string,
    contacts: string[],
    antiCSRFToken: string,
    csrfTokenTime: number,
    contactRequests: string[],
    blockedList: string[],
    privilegeLevel: string,
    ownedWorkflows: string[],
    workflows: string[],
    workflowTemplates: string[]
}