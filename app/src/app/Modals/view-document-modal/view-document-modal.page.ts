import { Component, OnInit } from '@angular/core';
import {Filesystem, Directory, Encoding} from '@capacitor/filesystem';

@Component({
  selector: 'app-view-document-modal',
  templateUrl: './view-document-modal.page.html',
  styleUrls: ['./view-document-modal.page.scss'],
})
export class ViewDocumentModalPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  downloadPDF(){
    console.log("here");
  }

}
