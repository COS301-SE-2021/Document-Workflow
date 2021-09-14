import { Phase } from "./Phase";
import { Types } from "mongoose";
import { DatabaseError } from "../error/Error";
import { IPhase } from "./IPhase";
type ObjectId = Types.ObjectId;

export class PhaseRepository{
    async savePhase(phase: IPhase): Promise<ObjectId> {
        try {
            const newPhase = new Phase(phase);
            const response: IPhase = await newPhase.save();
            return response._id;
        }
        catch(err){
            throw new DatabaseError("Could not save phase " + err.message);
        }
    }

    async getPhaseById(id: ObjectId): Promise<IPhase>{
        try{
            return await Phase.findById(id);
        }
        catch (err){
            throw new DatabaseError("Could not get phase by id" + err.message);
        }
    }

    async updatePhase(phase: IPhase): Promise<IPhase>{
        try{
            return await Phase.findOneAndUpdate(phase);
        }catch(err){
            throw new DatabaseError("Could not update phase " + err.message);
        }
    }

    async deletePhaseById(id: ObjectId): Promise<ObjectId> {
        try{
            const response = await Phase.findByIdAndDelete(id);
            return response._id;
        }catch(err){
            throw new DatabaseError("Could not delete phase " + err.message);
        }
    }
}