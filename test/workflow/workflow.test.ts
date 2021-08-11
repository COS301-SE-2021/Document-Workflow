import WorkFlowRepository from "../../src/workflow/WorkflowRepository";
import WorkFlowService from "../../src/workflow/WorkflowService";
import DocumentService from "../../src/document/DocumentService";
import UserRepository from "../../src/user/UserRepository";
import DocumentRepository from "../../src/document/DocumentRepository";
import WorkflowController from "../../src/workflow/WorkflowController";

describe("unit tests for workflow", () => {
    let workflowRepository;
    let workflowService;
    let workflowController;
    let documentService;

    beforeAll(() => {

    })

    beforeEach(()=> {
        documentService = new DocumentService(new DocumentRepository());
        workflowRepository = new WorkFlowRepository();
        workflowService = new WorkFlowService(workflowRepository, documentService, new UserRepository());
        workflowController = new WorkflowController(workflowService);
    })

    it("should", () => {

    })
})