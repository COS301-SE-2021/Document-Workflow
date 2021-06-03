import { Component, OnInit, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import {ModalController } from '@ionic/angular';

// import {ModalPage}
import { ActivatedRoute } from '@angular/router';
import { ViewDocumentModalPage } from '../Modals/view-document-modal/view-document-modal.page';
import { AddDocumentModalPage } from '../Modals/add-document-modal/add-document-modal.page';

import { User } from './../Interfaces/user';
import { Document } from '../Interfaces/document';
import { UserService } from '../Services/user.service';
import { DocumentService } from '../Services/document.service';

@Component({
  selector: 'app-view-workflow',
  templateUrl: './view-workflow.component.html',
  styleUrls: ['./view-workflow.component.scss'],
})

export class ViewWorkflowComponent implements OnInit {
  constructor(
    private storageService: UserService,
    private docStorage: DocumentService,
    private modals: ModalController,
  ) {}

  @Input() user:User;

  documents: Document[] = [];
  async ngOnInit() {
    this.user = await  this.storageService.getUser(1);
    this.documents = await this.docStorage.getDocuments(this.user.id);
    console.log(this.documents);
  }

  async viewDoc(id: number){
    const viewModal = await this.modals.create({
      component: ViewDocumentModalPage
      // componentProps: {
      //   'doc':
      // }
    });
    (await viewModal).onDidDismiss().then(()=>{
    });

    return (await viewModal).present();
  }

  async addDoc(){
    const addModal = await this.modals.create({
      component: AddDocumentModalPage
    });

    (await addModal).onDidDismiss().then(()=>{
    });

    return (await addModal).present()
  }
}
