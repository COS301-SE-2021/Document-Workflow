import { injectable } from "tsyringe";
import encryption from "../crypto/encryption";
import WorkflowHistoryRepository from "./WorkflowHistoryRepository";
import { Types } from "mongoose";
import {Entry, ENTRY_TYPE, WorkflowHistory} from './WorkflowHistory';
import {logger} from '../LoggingConfig';
import bcrypt from "bcrypt";
type ObjectId = Types.ObjectId;

@injectable()
export default class WorkflowHistoryService {

    constructor(
        private workflowHistoryRepository: WorkflowHistoryRepository,
        private encrypt: encryption) {
    }

    /**
     *
     * @param ownerEmail
     * @param workflowId
     * @return historyData A json object containing the id of the workflowHistory and hash generated for the first entry.
     */
    async createWorkflowHistory(ownerEmail, workflowId):Promise<{ id: ObjectId; hash: string }>{
        logger.info("Creating a new workflow history");
        const date = Date.now();
        const entry = new Entry();
        //The hash for the creation entry is unique since it does not have a previous entry to base its
        //Hash off of. Thus, we generate its hash based on partly on non-public data so that it cannot be forged.
        entry.hash = await bcrypt.hash((workflowId + date + process.env.WORKFLOW_CREATION_SECRET), parseInt(process.env.SALT_ROUNDS)).then(function(hash){
            return hash;
        })
            .catch(err => {
                throw new Error(err);
            });
        entry.userEmail = ownerEmail;
        entry.date = date;
        entry.type = ENTRY_TYPE.CREATE;
        entry.currentPhase = 0;

        const history = new WorkflowHistory({
            entries: [JSON.stringify(entry)],
        });

        return {
            hash: entry.hash,
            id: await this.workflowHistoryRepository.saveWorkflowHistory(history)
        };
    }

    async updateWorkflowHistory(historyId, user, eventType, currentPhase): Promise<string>{
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
        entry.date = Date.now();
        // @ts-ignore
        workflowHistory.entries.push(JSON.stringify(entry));

        await this.workflowHistoryRepository.saveWorkflowHistory(workflowHistory);
        return entry.hash;
    }

    /**
     * Retrieves a unique workflowHistory based on the input id. This id can only be found bt the workflow
     * which this history corresponds to, since we only want histories to be fetched in the contacts of workflows.
     * @param historyId
     */
    async getWorkflowHistory(historyId){
        return await this.workflowHistoryRepository.getWorkflowHistory(historyId);
    }

}
