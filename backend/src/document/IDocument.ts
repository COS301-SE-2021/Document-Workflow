import { Types } from 'mongoose';

export interface IDocument {
    _id?: Types.ObjectId,
    name: string,
    size: number,
    path: string,
    workflowId: Types.ObjectId
}