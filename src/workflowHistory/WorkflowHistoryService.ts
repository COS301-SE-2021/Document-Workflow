import { injectable } from "tsyringe";
import encryption from "../crypto/encryption";
import WorkflowHistoryRepository from "./WorkflowHistoryRepository";
import { ObjectId } from "mongoose";
import {Entry, ENTRY_TYPE, WorkflowHistory} from './WorkflowHistory';

@injectable()
export default class WorkflowHistoryService {

    constructor(
        private workflowHistoryRepository: WorkflowHistoryRepository,
        private encrypt: encryption) {
    }

    async createWorkflowHistory(ownerEmail):Promise<ObjectId>{

        const entry = new Entry();
        entry.userEmail = ownerEmail;
        entry.date = Date.now();
        entry.type = ENTRY_TYPE.CREATE;

        const history = new WorkflowHistory({
            entries: [JSON.stringify(entry)]
        });

        return await this.workflowHistoryRepository.saveWorkflowHistory(history);
    }

}
