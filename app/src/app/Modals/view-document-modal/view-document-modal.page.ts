import { Component, OnInit } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';


import { FormGroup, FormBuilder } from '@angular/forms';
import { Platform, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-view-document-modal',
  templateUrl: './view-document-modal.page.html',
  styleUrls: ['./view-document-modal.page.scss'],
})
export class ViewDocumentModalPage implements OnInit {
docForm: FormGroup;
docPDF = null;


  constructor(
    private formBuilder: FormBuilder,
    private plat: Platform,
    private http: HttpClient,
  ) {}

  ngOnInit() {}

  download(url: string, title: string) {

  }

  viewDoc(){

  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) =>{
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () =>{
      resolve(reader.result);
    }
    reader.readAsDataURL(blob);
  });

  private mimeTypeChecker(name){
    if(name.indexOf('pdf') >= 0){
      return 'application/pdf';
    }//add other mime types that would be required here
  }


}
