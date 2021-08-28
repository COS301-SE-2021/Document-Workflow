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

        const history = new WorkflowHistory({
            entries: [JSON.stringify(entry)]
        });

        logger.info(history);

        return await this.workflowHistoryRepository.saveWorkflowHistory(history);
    }

    async updateWorkflowHistory(historyId, user, eventType, currentPhase){
        logger.info("Updating a workflow history, history id is: " + historyId);
        const workflowHistory = await this.workflowHistoryRepository.getWorkflowHistory(historyId);
        const previousEntry = workflowHistory.entries[workflowHistory.entries.length -1];
        logger.info(previousEntry);
        const entry = new Entry();
        //entry.hash = bcrypt.hash(w, parseInt(process.env.SALT_ROUNDS))


    }

}
