import { Types } from 'mongoose';
type ObjectId = Types.ObjectId;

export interface IModel {
    _id?: ObjectId
}