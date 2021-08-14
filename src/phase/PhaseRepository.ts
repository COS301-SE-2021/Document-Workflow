import { PhaseProps, Phase } from "./Phase";
import { ObjectId } from "mongoose";
import {ServerError} from "../error/Error";

export class PhaseRepository{
    async savePhase(phase: PhaseProps): Promise<ObjectId> {
        try {
            const newPhase = new Phase(phase);
            await newPhase.save();
            return newPhase._id;
        }
        catch(e){
            console.log(e);
            throw e;
        }
    }

    async getPhaseById(id){
        try{
            return await Phase.findById(id);
        }
        catch (e){
            throw new ServerError(e);
        }
    }

    async updatePhase(phase: typeof Phase):Promise<void>{
        try{
            phase.save();
        }catch(e){
            throw new ServerError(e);
        }
    }
}