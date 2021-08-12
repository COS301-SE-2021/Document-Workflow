import DocumentController from "../../src/document/DocumentController";
import DocumentRepository from "../../src/document/DocumentRepository";
import DocumentService from "../../src/document/DocumentService";
import Database from "../../src/Database";
import dotenv from "dotenv";
import {Types} from "mongoose";
import crypto from "crypto";
dotenv.config();

describe("DocumentController: INTEGRATION TESTS", () => {
    let documentService;
    let documentController;

    beforeAll(async () => {
        await Database.get();
    });

    beforeEach(()=>{
        documentService = new DocumentService(new DocumentRepository());
        documentController = new DocumentController(documentService);
    });

    afterAll(async () => {
        await Database.disconnect();
    });

    test("Document Lifecycle: ", async () => {
        const id = Types.ObjectId(crypto.randomBytes(12).toString('hex'));

        //const deleteDoc = documentController.

        const createDocumentRequest = {
            body: {
                _id: id,
                workflow_id: "123456789",
                doc_name: "testDocument.pdf",
                mimetype: "document/pdf",
                encoding: "7bit",
                size: 501059220,
                document_path: "/path/to/file"
            },
            files: {
                file: "thetextversionofafile"
            }
        } as unknown as Request;

        //add document:
        const doc = await documentController.uploadDocumentRoute(createDocumentRequest);
        expect(doc.size).toBe(501059220);
        expect(doc._id).toBe(id);
    });
});