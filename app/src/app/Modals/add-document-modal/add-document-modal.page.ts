import { Component, OnInit, Input } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { DocumentService } from './../../Services/document.service';
import { User } from './../../Interfaces/user';
import { Document } from './../../Interfaces/document';

@Component({
  selector: 'app-add-document-modal',
  templateUrl: './add-document-modal.page.html',
  styleUrls: ['./add-document-modal.page.scss'],
})
export class AddDocumentModalPage implements OnInit {
  docForm: FormGroup;

  @Input() user: User;
  constructor(
    private formBuilder: FormBuilder,
    private modal: ModalController,
    private docService: DocumentService
  ) {}

  ngOnInit() {
    this.docForm = this.formBuilder.group({
      docName: ['', []],
      documentDescription: ['', [Validators.required]],
      documentStatus: ['', [Validators.required]],
      documentType: ['', [Validators.required]],

    });
  }

  dismissModal() {
    this.modal.dismiss();
  }

  async addDocument() {
    console.log(await this.docService.getDocuments(1));
    let formCopy = this.docForm.value;
    console.log(formCopy);
    formCopy.userID = 1;
    await this.docService.addDocument(formCopy);
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
