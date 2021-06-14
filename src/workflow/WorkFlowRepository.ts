import WorkFlow, {WorkFlowI} from "./WorkFlow";

export default class WorkFlowRepository{

    async postWorkFlow(workflow: WorkFlowI) : Promise<void> {

        const new_workflow = new WorkFlow({
            name: workflow.name,
            owner_id: workflow.owner_id,
            owner_email: workflow.owner_email,
            document_id: workflow.document_id,
            document_path: workflow.document_path,
            members: workflow.members

        });
        try {
            await new_workflow.save();
        } catch (err) {
            throw err;
        }
    }



}