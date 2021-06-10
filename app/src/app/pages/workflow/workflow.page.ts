import { Component, OnInit, Input } from '@angular/core';
import { fromEventPattern } from 'rxjs';


//interface and services
import { User } from  './../../Services/User/user-api.service';
import { documentImage, DocumentAPIService } from './../../Services/Document/document-api.service';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';


@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.page.html',
  styleUrls: ['./workflow.page.scss'],
})
export class WorkflowPage implements OnInit {
  documents: documentImage[]=[];
  @Input() user: User;
  constructor(
    private docService: DocumentAPIService,
    private modals: ModalController,
    private plat : Platform,
    private router: Router
  ) {}



  async ngOnInit() {}

  loadDocuments() {
    this.docService.getDocuments().subscribe();
  }



  async editDoc(id: number) {
    // const editModal = await this.modals.create({
    //   component: EditDocumentModalPage,
    //   componentProps: {
    //     docID: id,
    //   },
    // });
    // (await editModal).onDidDismiss().then(() => {});

    // return (await editModal).present();
  }

  async addWorkflow() {
    // const addModal = await this.modals.create({
    //   component: AddDocumentModalPage,
    // });

    // (await addModal).onDidDismiss().then(() => {});

    // return (await addModal).present();
  }

  viewWorkFlow(){
    this.router.navigate(['view']);
  }
}
