import { Types } from 'mongoose';

export interface IWorkflow {
    _id?: Types.ObjectId,
    name: string,
    ownerId: Types.ObjectId,
    ownerEmail: string,
    documentId?: Types.ObjectId,
    historyId?: Types.ObjectId,
    description: string,
    phases?: string[],
    currentPhase?: number,
    status?: string,
    currentHash?: string
}
