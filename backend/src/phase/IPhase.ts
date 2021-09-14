import { Types } from 'mongoose';

export interface IPhase {
    _id?: Types.ObjectId,
    //users: Types.ObjectId[],
    users: string,
    annotations: string,
    description: string,
    status: string
}