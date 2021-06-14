import { injectable } from "tsyringe";
import {WorkflowI} from './WorkFlow';
import WorkFlowRepository from './WorkFlowRepository';

@injectable()
export default class WorkFlowService{

    constructor(private workflowRepository: WorkFlowRepository)
    {

    }
}