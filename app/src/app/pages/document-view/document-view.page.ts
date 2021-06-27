/* eslint-disable @angular-eslint/no-input-rename */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit, Input } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';


import { ModalController, NavParams, Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { AddSignatureComponent } from 'src/app/components/add-signature/add-signature.component';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentAPIService } from 'src/app/Services/Document/document-api.service';
import { async } from '@angular/core/testing';
import { ConfirmSignaturesComponent } from 'src/app/components/confirm-signatures/confirm-signatures.component';
import { UserAPIService } from 'src/app/Services/User/user-api.service';

@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.page.html',
  styleUrls: ['./document-view.page.scss'],
})
export class DocumentViewPage implements OnInit {
  srcFile: any;
  rotated: number;
  setZoom: any;
  zoomLevel: number;


  @Input('id') id: string;
  @Input('documentname') docName: string;
  constructor(
    private modalCtrl: ModalController,
    private navpar: NavParams,
    private route: ActivatedRoute,
    private docApi: DocumentAPIService,
    private router: Router,
    private userApiService: UserAPIService
  ) {}

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

    this.rotated = 0;
    this.setZoom = 'false';
    this.zoomLevel=1;
    await this.route.params.subscribe(stuff =>{
      this.id = stuff['id'];
      this.docName = stuff['documentname'];
    });
    await (this.getDocument(this.id));
  }

  download() {
    const blob = new Blob([this.srcFile], {type: 'application/pdf'});
    const objUrl = URL.createObjectURL(blob);


    var link = document.createElement('a');
    link.href = objUrl;
    link.download = this.docName;
    document.body.appendChild(link);

    link.click();
    link.remove();
  }

  back(){
    this.router.navigate(['home']);
  }


  getDocument(id: string){
    this.docApi.getDocument(id, (response)=>{
      if (response){
        const buff = response.data.filedata.Body.data; //wut
        const a  = new Uint8Array( buff);
        this.srcFile = a;
      }else{

      }
    });
  }

  async sign(){
    const sign = this.modalCtrl.create({
      component: ConfirmSignaturesComponent
    });

   (await sign).present();

    const data =  (await sign).onDidDismiss();
    if(await (await data).data['confirm']){
      this.addSignature();
    }
  }

  rotation(){
    this.rotated += 90;
    if(this.rotated === 360){
      this.rotated =0;
    }
  }

  setZoomWidth(){
    this.setZoom ='page-width';
    console.log('width');
  }

  setZoomFit(){
    this.setZoom ='page-fit';
    console.log('fit');
  }

  setZoomHeight(){
    this.setZoom ='page-height';
    console.log('height');
  }

  zoomIn(){
    this.zoomLevel += 0.25;
    console.log('in');
  }

  zoomOut(){
    this.zoomLevel -=0.25;
    console.log('out');
  }

  addSignature(){
    console.log('here');
  }
}
