import { Model, Types } from 'mongoose';
import { DatabaseError } from "../error/Error";
import { IModel } from "./IModel";
type ObjectId = Types.ObjectId;

export abstract class Repository<T> {
    async save(object: T): Promise<T> {
        try{
            const model = new Model(object);
            const response = await model.prototype.save();
            if(response) return response;
            else return null;
        }catch(err){
            throw new DatabaseError(err.message);
        }
    }

    async find(id: ObjectId): Promise<T> {
        try{
            return await Model.prototype.findOne({_id: id}).lean();
        }catch(err){
            throw new DatabaseError(err.message);
        }
    }

    async update(object: IModel): Promise<T> {
        try{
            return await Model.prototype.updateOne(object._id, object).lean();
        }catch(err){
            throw new DatabaseError(err.message);
        }
    }

    async delete(id: ObjectId): Promise<T> {
        try{
            return await Model.prototype.findOneAndDelete({_id: id}).lean();
        }catch(err){
            throw new DatabaseError(err.message);
        }
    }
}
