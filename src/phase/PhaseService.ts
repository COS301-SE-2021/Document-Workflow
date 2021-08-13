import { PhaseRepository } from "./PhaseRepository";
import { injectable } from "tsyringe";
import { PhaseProps } from "./Phase";
import { ObjectId } from "mongoose";

@injectable()
export class PhaseService{
    constructor(private phaseRepository: PhaseRepository) {
    }

    async createPhase(phase: PhaseProps): Promise<ObjectId>{
        return await this.phaseRepository.savePhase(phase);
    }

    async getPhaseById(id): Promise<any>{
        return await this.phaseRepository.getPhaseById(id);
    }
}