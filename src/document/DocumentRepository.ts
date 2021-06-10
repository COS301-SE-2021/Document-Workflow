import Document from "./Document";
import Database from "../Database";
import { injectable } from "tsyringe";

@injectable()
export default class DocumentRepository {
    db: Database;

    constructor(db: Database) {
        this.db = db;
        this.db.get()
            .then(() => {
                console.log("connection received");
            })
            .catch((err) => {
                console.error(err);
            });
    }

    async postDocument(file): Promise<void> {
        const newDocument = new Document({
            doc_name: file.name,
            mimetype: file.mimetype,
            encoding: file.encoding,
            size: file.size,
        });
        try{
            return await newDocument.save();
        } catch (err) {
            return err;
        }
    }

    async getDocuments(): Promise<Document[]> {
        try {
            return await Document.find()
        } catch(err) {
            return err;
        }
    }
}
