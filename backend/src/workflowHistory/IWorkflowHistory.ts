import { Types } from 'mongoose';

export interface IWorkflowHistory {
    _id?: Types.ObjectId,
    entries: string[]
}