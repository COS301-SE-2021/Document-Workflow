import { Types } from 'mongoose';
type ObjectId = Types.ObjectId;

export interface IAI {
    _id?: ObjectId,
    jsonData: string,
    creationDate: number,
    accuracy: number
}