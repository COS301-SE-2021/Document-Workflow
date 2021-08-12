import { PhaseProps, Phase } from "./Phase";
import { ObjectId } from "mongoose";

export class PhaseRepository{
    async savePhase(phase: PhaseProps): Promise<ObjectId> {
        const newPhase = new Phase(phase);
        await newPhase.save();
        return newPhase._id;
    }
}