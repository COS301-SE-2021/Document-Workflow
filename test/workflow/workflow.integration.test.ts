import Database from "../../src/Database";
import WorkFlowRepository from "../../src/workflow/WorkflowRepository";

describe("Workflow: Integration tests", () => {
    let workflowService;
    let workflowController;

    beforeAll(async () => {
        await Database.get();
    });

    beforeEach(() => {
        workflowService = new workflowService(new WorkFlowRepository());
        workflowController = new workflowController(workflowService);
    });

    afterAll(async () => {
        await Database.disconnect();
    });

    it("should create a new workflow, if it doesn't exist", () => {

    })

    it("should delete the workflow", () => {

    })
})