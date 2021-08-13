import { PhaseProps, Phase } from "./Phase";
import { ObjectId } from "mongoose";
import {ServerError} from "../error/Error";

export class PhaseRepository{
    async savePhase(phase: PhaseProps): Promise<ObjectId> {
        const newPhase = new Phase(phase);
        await newPhase.save();
        return newPhase._id;
    }

    async getPhaseById(id){
        try{
            return await Phase.findById(id);
        }
        catch (e){
            throw new ServerError(e);
        }
    }
}