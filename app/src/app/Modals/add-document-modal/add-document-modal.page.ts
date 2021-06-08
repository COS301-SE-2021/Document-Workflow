import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup, Validators,} from '@angular/forms';
import { AbstractControlOptions, FormBuilder } from '@angular/forms';

import { ActionSheetController, ModalController, Platform } from '@ionic/angular';
import { User } from './../../Interfaces/user';
import { Document } from './../../Interfaces/document';

@Component({
  selector: 'app-add-document-modal',
  templateUrl: './add-document-modal.page.html',
  styleUrls: ['./add-document-modal.page.scss'],
})
export class AddDocumentModalPage implements OnInit {
  documentForm: FormGroup;

  @Input() user: User;
  constructor(
    private formBuilder: FormBuilder,
    private modal: ModalController,
    private plat: Platform,
    private actionSheet: ActionSheetController
  ) {}

  ngOnInit() {
    this.docForm = this.formBuilder.group({
      documentName: ['', []],
      documentDescription: ['', [Validators.required]],
      documentStatus: ['', [Validators.required]],
      documentType: ['', [Validators.required]],

    });
  }

  dismissModal() {
    this.modal.dismiss();
  }

  async addDocument() {

    this.dismissModal();
  }

  async loadDocument(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = () => {
      // getting image blob
      let blob: Blob = new Blob([new Uint8Array(reader.result as ArrayBuffer)]);

      //  create URL element Object
      let URL_blob: string = URL.createObjectURL(blob);
    };

    // error checking
    reader.onerror = (error) => {};
  }
}
