/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit, Input } from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';

// import routing
import { ActivatedRoute, Router } from '@angular/router';



// for the module pages


//imports for services and interfaces
import { User, UserAPIService } from '../../Services/User/user-api.service';
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
    private router: Router,
    private userApiService: UserAPIService
  ) {}

  @Input() user: User;

  async ngOnInit() {
    if(localStorage.getItem('token') === null) {
      await this.router.navigate(['/login']);
      return;
    }
    else
    {
      this.userApiService.checkIfAuthorized().subscribe((response) => {
        console.log("Successfully authorized user");
      }, async (error) => {
        console.log(error);
        await this.router.navigate(['/login']);
        return;
      });
    }
  }

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

  back(){
    this.router.navigate(['viewAll']);
  }
}
