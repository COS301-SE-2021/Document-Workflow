import { Types } from "mongoose";
type ObjectId = Types.ObjectId;

export enum privilegeLevel { ADMIN, USER}

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
    contacts: ObjectId[],
    contactRequests: string[],
    blockedList: string[],
    privilegeLevel: string,
    ownedWorkflows: ObjectId[],
    workflows: ObjectId[],
    workflowTemplates: ObjectId[]
}