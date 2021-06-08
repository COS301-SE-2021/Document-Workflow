import { Component, OnInit, Input } from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';


// import {ModalPage}
import { ActivatedRoute, Router } from '@angular/router';


// for the module pages
import { AddDocumentModalPage } from '../Modals/add-document-modal/add-document-modal.page';
import { EditDocumentModalPage } from '../Modals/edit-document-modal/edit-document-modal.page';

//for the interfaces
import { User } from './../Interfaces/user';

//imports for services and interfaces
import { DocumentAPIService, documentImage } from '../Services/document-api.service';

@Component({
  selector: 'app-view-workflow',
  templateUrl: './view-workflow.component.html',
  styleUrls: ['./view-workflow.component.scss'],
})
export class ViewWorkflowComponent implements OnInit {
  documents: documentImage[]=[];

  constructor(
    private docService: DocumentAPIService,
    private modals: ModalController,
    private plat : Platform,
    private router: Router
  ) {}

  @Input() user: User;

  async ngOnInit() {}

  loadDocuments() {
    this.docService.getDocuments().subscribe();
  }

  async viewDoc(id: number) {
    this;
    Browser.open({
      url: 'https://github.com/COS301-SE-2021/Document-Workflow/blob/develop_frontend_document_view/app/src/app/Files/Timesheet-Template.pdf',
    });
  }

  async editDoc(id: number) {
    const editModal = await this.modals.create({
      component: EditDocumentModalPage,
      componentProps: {
        docID: id,
      },
    });
    (await editModal).onDidDismiss().then(() => {});

    return (await editModal).present();
  }

  async addDoc() {
    const addModal = await this.modals.create({
      component: AddDocumentModalPage,
    });

    (await addModal).onDidDismiss().then(() => {
      this.router.navigate(["view"]);
    });

    return (await addModal).present();
  }
}
