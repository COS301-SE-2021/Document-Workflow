import { Component, OnInit, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';

// import {ModalPage}
import { ActivatedRoute } from '@angular/router';

import { AddDocumentModalPage } from '../Modals/add-document-modal/add-document-modal.page';

import { User } from './../Interfaces/user';
import { Document } from '../Interfaces/document';
import { UserService } from '../Services/user.service';
import { DocumentService } from '../Services/document.service';

import { Browser } from '@capacitor/browser';

import {
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { EditDocumentModalPage } from '../Modals/edit-document-modal/edit-document-modal.page';

@Component({
  selector: 'app-view-workflow',
  templateUrl: './view-workflow.component.html',
  styleUrls: ['./view-workflow.component.scss'],
})
export class ViewWorkflowComponent implements OnInit {
  constructor(
    private storageService: UserService,
    private docStorage: DocumentService,
    private modals: ModalController
  ) {}

  @Input() user: User;
  documents: Document[] = [];

  async ngOnInit() {
    this.user = await this.storageService.getUser(1);
    this.documents = await this.docStorage.getDocuments(this.user.id);
    console.log(this.documents);
  }

  async viewDoc(id: number) {
    // const viewModal = await this.modals.create({
    //   component: ViewDocumentModalPage
    //   // componentProps: {
    //   //   'doc':
    //   // }
    // });
    // (await viewModal).onDidDismiss().then(()=>{
    // });

    // return (await viewModal).present();
    Browser.open({
      url: 'https://github.com/COS301-SE-2021/Document-Workflow/blob/develop_frontend_document_view/app/src/app/Files/Timesheet-Template.pdf',
    });
  }

  async editDoc(id: number) {
    const editModal = await this.modals.create({
      component: EditDocumentModalPage,
      componentProps:{
        'docID': id,
      }
    });
     (await editModal).onDidDismiss().then(()=>{});

      return (await editModal).present();
  }

  async addDoc() {
    const addModal = await this.modals.create({
      component: AddDocumentModalPage,
    });

    (await addModal).onDidDismiss().then(() => {});

    return (await addModal).present();
  }
}
