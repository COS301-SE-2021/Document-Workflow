/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit, Input } from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';

// import routing
import { ActivatedRoute, Router } from '@angular/router';



// for the module pages


//imports for services and interfaces
import { User } from '../../Services/User/user-api.service';
import { DocumentAPIService, documentImage } from '../../Services/Document/document-api.service';
import { DocumentViewPage } from '../document-view/document-view.page';

@Component({
  selector: 'app-document-archive',
  templateUrl: './document-archive.page.html',
  styleUrls: ['./document-archive.page.scss'],
})
export class DocumentArchivePage implements OnInit {
  documents: documentImage[]=[];

  constructor(
    private docService: DocumentAPIService,
    private modals: ModalController,
    private plat: Platform,
    private router: Router
  ) {}

  @Input() user: User;

  async ngOnInit() {}

  loadDocuments() {
    // this.docService.getDocuments().subscribe();
  }

  async viewDoc() {
    const editModal = await this.modals.create({
      component: DocumentViewPage,
    });
    (await editModal).onDidDismiss().then(() => {});

    return (await editModal).present();
  }

  // async editDoc(id: number) {
  //   const editModal = await this.modals.create({
  //     component: EditDocumentModalPage,
  //     componentProps: {
  //       docID: id,
  //     },
  //   });
  //   (await editModal).onDidDismiss().then(() => {});

  //   return (await editModal).present();
  // }

  // async addDoc() {
  //   const addModal = await this.modals.create({
  //     component: AddDocumentModalPage,
  //   });

  //   (await addModal).onDidDismiss().then(() => {});

  //   return (await addModal).present();
  // }

  back(){
    this.router.navigate(['viewAll']);
  }
}
