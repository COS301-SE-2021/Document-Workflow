import { Phase } from "./Phase";
import { Types } from "mongoose";
import { DatabaseError } from "../error/Error";
import { IPhase } from "./IPhase";
import {User} from "../user/User";
import {IWorkflow} from "../workflow/IWorkflow";
import {Workflow} from "../workflow/Workflow";
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

    async updatePhaseAnnotations(phase: IPhase): Promise<boolean>{
        console.log("Phase repository, updating phase annotations");
        console.log(phase);
        try{
            const result = await Phase.updateOne({_id: phase._id},
                {$set:{annotations: phase.annotations}});
            console.log(result);
            return !!result;
        }
        catch(err){
            throw new DatabaseError("Could not update Phase " + err.message);
        }
    }

    async updatePhase(phase: IPhase): Promise<any>{
        console.log("Phase repository, updating phase");
        console.log(phase);
        try{
            const response: IWorkflow = await Phase.updateOne({_id: phase._id}, phase).lean();
            return !!response;
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