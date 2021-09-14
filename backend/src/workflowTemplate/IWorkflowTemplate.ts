import { Types } from "mongoose";
type ObjectId = Types.ObjectId;

export interface IWorkflowTemplate {
    _id?: ObjectId,
    templateName: string,
    templateDescription: string,
    templateOwnerId: ObjectId,
    templateOwnerEmail: string,
    workflowName: string,
    workflowDescription: string,
    phases: string[],
    documentName: string
}