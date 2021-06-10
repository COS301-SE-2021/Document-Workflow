import { Component, OnInit, Input } from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';

// import routing
import { ActivatedRoute, Router } from '@angular/router';



// for the module pages
import { AddDocumentModalPage } from '../Modals/add-document-modal/add-document-modal.page';
import { EditDocumentModalPage } from '../Modals/edit-document-modal/edit-document-modal.page';
import { ViewDocumentModalPage } from '../Modals/view-document-modal/view-document-modal.page';
//for the interfaces
import { User } from './../Interfaces/user';

//imports for services and interfaces
import { DocumentAPIService, documentImage } from '../Services/document-api.service';

@Component({
  selector: 'app-document-archive',
  templateUrl: './document-archive.component.html',
  styleUrls: ['./document-archive.component.scss'],
})
export class DocumentArchiveComponent implements OnInit {
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

  async viewDoc() {
    console.log("here");
    const editModal = await this.modals.create({
      component: ViewDocumentModalPage,
    });
    (await editModal).onDidDismiss().then(() => {});

    return (await editModal).present();
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

    (await addModal).onDidDismiss().then(() => {});

    return (await addModal).present();
  }

  back(){
    this.router.navigate(['viewAll']);
  }
}
