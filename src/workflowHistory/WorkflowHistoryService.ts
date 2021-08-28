import { injectable } from "tsyringe";
import encryption from "../crypto/encryption";
import WorkflowHistoryRepository from "./WorkflowHistoryRepository";
import { ObjectId } from "mongoose";
import {Entry, ENTRY_TYPE, WorkflowHistory} from './WorkflowHistory';
import {logger} from './../LoggingConfig';
import bcrypt from "bcrypt";

@injectable()
export default class WorkflowHistoryService {

    constructor(
        private workflowHistoryRepository: WorkflowHistoryRepository,
        private encrypt: encryption) {
    }

    async createWorkflowHistory(ownerEmail):Promise<ObjectId>{
        logger.info("Creating a new workflow history");

        const entry = new Entry();
        entry.hash = "";
        entry.userEmail = ownerEmail;
        entry.date = Date.now();
        entry.type = ENTRY_TYPE.CREATE;
        entry.currentPhase = 0;

        const history = new WorkflowHistory({
            entries: [JSON.stringify(entry)]
        });

        logger.info(history);

        return await this.workflowHistoryRepository.saveWorkflowHistory(history);
    }

    async updateWorkflowHistory(historyId, user, eventType, currentPhase){
        logger.info("Updating a workflow history, history id is: " + historyId);
        const workflowHistory = await this.workflowHistoryRepository.getWorkflowHistory(historyId);
        // @ts-ignore
        const previousEntry = JSON.parse( workflowHistory.entries[workflowHistory.entries.length -1] );
        logger.info(previousEntry);
        const entry = new Entry();
        entry.hash = await bcrypt.hash(previousEntry.userEmail + previousEntry.data + previousEntry.type + previousEntry.currentPhase, parseInt(process.env.SALT_ROUNDS)).then(function(hash){
            return hash;
             })
            .catch(err => {
                throw new Error(err);
            });
        entry.userEmail = user.email;
        entry.type = eventType;
        entry.currentPhase = currentPhase;
        // @ts-ignore
        workflowHistory.entries.push(JSON.stringify(entry));

        await this.workflowHistoryRepository.saveWorkflowHistory(workflowHistory);
    }

}
