import WorkflowRepository from "../../src/workflow/WorkflowRepository";
import WorkflowService from "../../src/workflow/WorkflowService";
import DocumentService from "../../src/document/DocumentService";
import UserRepository from "../../src/user/UserRepository";
import DocumentRepository from "../../src/document/DocumentRepository";
import WorkflowController from "../../src/workflow/WorkflowController";
import UserService from "../../src/user/UserService";
import { PhaseRepository } from "../../src/phase/PhaseRepository";
import Authenticator from "../../src/security/Authenticate";
import sinon from "sinon";
import WorkflowTemplateService from "../../src/workflowTemplate/WorkflowTemplateService";
// @ts-ignore
import crypto from "crypto";
import { Types } from "mongoose";
type ObjectId = Types.ObjectId;
import { PhaseError } from "../../src/error/Error";
import WorkflowHistoryService from "../../src/workflowHistory/WorkflowHistoryService";
import WorkflowTemplateRepository from "../../src/workflowTemplate/WorkflowTemplateRepository";
import WorkflowHistoryRepository from "../../src/workflowHistory/WorkflowHistoryRepository";

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
    let workflowHistoryService;
    let workflowTemplateService;
    let encrypt;

    const randomObjectId: ObjectId = new Types.ObjectId(crypto.randomBytes(12));
    const userEmail1 = "email1@user.com";
    const userEmail2 = "email2@user.com";
    const userEmail3 = "email3@user.com";
    const randomDocument: ObjectId = new Types.ObjectId(crypto.randomBytes(20));

    beforeEach(() => {
        workflowRepository = new WorkflowRepository();
        userRepository = new UserRepository();
        documentRepository = new DocumentRepository();
        phaseRepository = new PhaseRepository();
        userService = new UserService(userRepository);
        documentService = new DocumentService(documentRepository);
        authenticationService = new Authenticator();
        workflowHistoryService = new WorkflowHistoryService(new WorkflowHistoryRepository())
        workflowTemplateService = new WorkflowTemplateService(new WorkflowTemplateRepository(), userService, documentService)

        workflowService = new WorkflowService(
            workflowRepository,
            documentService,
            userService,
            phaseService,
            workflowTemplateService,
            workflowHistoryService);

        workflowController = new WorkflowController(workflowService, authenticationService);
    });

    it("should fail to create a workflow with non-existent users", async () => {
        sinon.stub(userService, "getUserByEmail").returns(undefined);
        const jsonPhases = JSON.stringify([
            {
                annotations: "alonghexstring",
                description: "description of phase 1",
                users: [ userEmail1, userEmail2 ],
                signingUserId: userEmail3
            }
        ])
        const request = {
            body: {
                name: "WorkflowName",
                description: "description of the workflow",
                phases: jsonPhases
            },
            user: {
                email: "testemail@email.com",
                _id: randomObjectId
            },
            files: {
                document: {
                    name: "testDocument",
                    data: randomDocument
                }
            }
        }
        expect(await workflowController.createWorkflowRoute(request)).
        toStrictEqual(
            {"data": {},
                "message": "A phase contains a user that does not exist",
                "status": "error"
            })
    });

    it("should fail to delete a workflow that doesn't exist", async() => {
        sinon.stub(workflowRepository, "getWorkflow").returns(undefined);
        const response = await workflowService.deleteWorkFlow(randomObjectId, userEmail1);
        expect(response).toStrictEqual({status: "failed", data: {}, message: "Workflow does not exist"});
    });

    it("should fail to let a user delete another user's workflow", async() => {
        sinon.stub(workflowRepository, "getWorkflow").returns(undefined);
    })
})