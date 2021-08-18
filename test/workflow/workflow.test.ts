import WorkflowRepository from "../../src/workflow/WorkflowRepository";
import WorkflowService from "../../src/workflow/WorkflowService";
import DocumentService from "../../src/document/DocumentService";
import UserRepository from "../../src/user/UserRepository";
import DocumentRepository from "../../src/document/DocumentRepository";
import WorkflowController from "../../src/workflow/WorkflowController";
import UserService from "../../src/user/UserService";
import { PhaseRepository } from "../../src/phase/PhaseRepository";
import Authenticator from "../../src/security/Authenticate";

describe("unit tests for workflow", () => {
    let workflowRepository;
    let userRepository;
    let documentRepository;
    let phaseRepository;

    let workflowService;
    let userService;
    let documentService;
    let phaseService;

    let authenticationService;

    let workflowController;

    beforeAll(() => {

    })

    beforeEach(()=> {
        workflowRepository = new WorkflowRepository();
        userRepository = new UserRepository();
        documentRepository = new DocumentRepository();
        phaseRepository = new PhaseRepository();

        userService = new UserService(userRepository, workflowRepository);
        documentService = new DocumentService(documentRepository);
        authenticationService = new Authenticator(userService);
        workflowService = new WorkflowService(workflowRepository, documentService, userService, phaseService);

        workflowController = new WorkflowController(workflowService, authenticationService);
    })

    it("should verify that a user is verified", () => {

    })

    it("", () => {

    })

    it("", () => {

    })

    it("", () => {

    })

    it("", () => {

    })

    it("", () => {

    })
})