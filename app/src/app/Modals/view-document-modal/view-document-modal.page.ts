import { Component, OnInit } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import {Plugins} from '@capacitor/core';
const {Browser} = Plugins;


@Component({
  selector: 'app-view-document-modal',
  templateUrl: './view-document-modal.page.html',
  styleUrls: ['./view-document-modal.page.scss'],
})
export class ViewDocumentModalPage implements OnInit {
  constructor(
  ) {}

  ngOnInit() {}

  download(url: string, title: string) {

  }

  viewDoc(){
    Browser.open({url: 'http://127.0.0.1/Files/Timesheet-Template.pdf'});
  }
}
