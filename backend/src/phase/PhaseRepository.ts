import { Phase } from "./Phase";
import { Types } from "mongoose";
import { DatabaseError } from "../error/Error";
import { IPhase } from "./IPhase";
import {User} from "../user/User";
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
            return await Phase.findById(id).lean();
        }
        catch (err){
            throw new DatabaseError("Could not get phase by id" + err.message);
        }
    }

    async updatePhase(phase: IPhase): Promise<any>{
        try{
            return await Phase.updateOne({phase: phase._id},
                {
                    users: phase.users,
                    annotations: phase.annotations,
                    description: phase.description,
                    status: phase.status
                });
        }
        catch(err){
            throw new DatabaseError("Could not update Phase " + err.message);
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