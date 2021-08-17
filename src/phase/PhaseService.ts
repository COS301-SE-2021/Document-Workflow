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

    async updatePhase(phase) :Promise<void>{
        await this.phaseRepository.updatePhase(phase);
    }

    async deletePhaseById(id){
        await this.phaseRepository.deletePhaseById(id);
    }

    /**
     * This function sets the accepted values of all the phase users to false, updates the status of the phase
     * and saves the phase to the database. It is used when reverting a workflow to a previous phase.
     * @param phase
     * @param status
     */
    async resetPhaseAndSave(phase, status) {

        let phaseUsers = JSON.parse(phase.users);
        for (let i = 0; i < phaseUsers.length; ++i) {
            console.log(phaseUsers[i]);
            phaseUsers[i].accepted = 'false';
        }
        phase.status = status;
        phase.users = JSON.stringify(phaseUsers);
        await this.updatePhase(phase);
    }

}