import { PhaseRepository } from "./PhaseRepository";
import { injectable } from "tsyringe";
import { IPhase } from "./IPhase";
import { Types } from "mongoose";
type ObjectId = Types.ObjectId;

@injectable()
export default class PhaseService{
    constructor(private phaseRepository: PhaseRepository) {
    }

    async createPhase(phase: IPhase): Promise<ObjectId>{
        try{
            return await this.phaseRepository.savePhase(phase);
        }catch(err){
            throw err;
        }
    }

    async getPhaseById(id): Promise<IPhase>{
        try{
            return await this.phaseRepository.getPhaseById(id);
        }catch(err){
            throw err;
        }
    }

    async updatePhase(phase: IPhase): Promise<void>{
        try{
            await this.phaseRepository.updatePhase(phase);
        }catch(err){
            throw err;
        }
    }

    async updatePhaseAnnotations(phase: IPhase): Promise<boolean>{
        try{
            return await this.phaseRepository.updatePhaseAnnotations(phase);
        }catch(err){
            throw err;
        }
    }

    async deletePhaseById(id: ObjectId): Promise<ObjectId>{
        try{
            return await this.phaseRepository.deletePhaseById(id);
        }catch(err){
            throw err;
        }
    }

    /**
     * This function sets the accepted values of all the phase users to false, updates the status of the phase
     * and saves the phase to the database. It is used when reverting a workflow to a previous phase.
     * @param phase
     * @param status
     */
    async resetPhaseAndSave(phase: IPhase, status) {
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