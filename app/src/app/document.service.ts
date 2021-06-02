import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Document } from './document';

@Injectable({
  providedIn: 'root',
})
export class DocumentService{
  private _storage: Storage;
  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  async initUser() {
    const document: Document[] = [
      {
        id: 1,
        userID: 1,
        documentName: 'timeSheet01.pdf',
        documentLocation: 'timeSheets',
        status: 0.5,
        type: "pdf",
        description:"this is the description of the document"
      },
    ];
    await this.storage.set('documents', document);
  }


   async getDocuments(id: number): Promise<Document[]> {
    const docs = await this._storage?.get('documents');
    if (!docs) {
      await this.initUser();
      return await this._storage?.get('documents');
    }

    return docs;
  }

  async addDocument(doc: Document): Promise<void> {
    const docs: Document[] = await this._storage.get('documents');
    const lastID = Math.max(...docs.map(x => x.id));
    doc.id = lastID + 1;
    docs.push(doc);

    await this._storage.set('documents', doc);
  }

  async updateDocument(doc: Document): Promise<void> {
    const docs: Document[] = await this.storage.get('documents');

    const index = docs.findIndex(x => x.id === doc.id);

    if (index > -1) {
      docs[index] = doc;
      await this._storage.set('documents', docs);
    }
  }

  async deleteDocument(doc: Document): Promise<void> {
    const docs: Document[] = await this._storage.get('documents');

    const index = docs.findIndex(x => x.id === doc.id);

    if (index > 1) {
      docs.splice(index, 1);
      await this._storage.set('documents', docs);
    }
  }
}
