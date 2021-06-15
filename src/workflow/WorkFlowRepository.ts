import WorkFlow, {WorkFlowI} from "./WorkFlow";

export default class WorkFlowRepository{

    async postWorkFlow(workflow: WorkFlowI) : Promise<any> {
        console.log("Posting a new workflow");
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
        return new_workflow._id;
    }

    async putWorkFlow(workflow: WorkFlowI) :Promise<void>{
        try{
            const _workflow = WorkFlow.findById(workflow._id);
            if(_workflow){ //this is just to avoid creating a new workflow by accident
                const updated_workflow = await WorkFlow.updateOne({_id:workflow._id},
                    {
                        owner_id: workflow.owner_id,
                        name: workflow.name,
                        owner_email: workflow.owner_email,
                        document_id: workflow.document_id,
                        document_path: workflow.document_path,
                        members: workflow.members
                    });

                /*
                const update_workflow = new WorkFlow({
                        _id: workflow._id,
                        name: workflow.name,
                        owner_id: workflow.owner_id,
                        owner_email: workflow.owner_email,
                        document_id: workflow.document_id,
                        document_path: workflow.document_path,
                        members: workflow.members
                });
                console.log(update_workflow);
                await update_workflow.save();
                return update_workflow;*/
            }
            else throw "Failed to update workflow";
        }
        catch(err){
            throw err;
        }
    }

    async getWorkFlow(id:string):Promise<WorkFlowI>{
        try{
            return await WorkFlow.findById(id);
        }
        catch(err){
            throw err;
        }
    }

}