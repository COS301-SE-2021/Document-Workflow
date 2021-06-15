import Document, { DocumentI } from "./Document";

export default class DocumentRepository {

    async postDocument(request): Promise<void> {
        const file = request.files.file;
        const doc = new Document({
            doc_name: file.name,
            mimetype: file.mimetype,
            encoding: file.encoding,
            size: file.size,
        });
        try{
            await doc.save();
        } catch (err) {
            throw err;
        }
    }

    async getDocuments(): Promise<DocumentI[]> {
        try {
            return await Document.find({});
        } catch(err) {
            throw err;
        }
    }
}
