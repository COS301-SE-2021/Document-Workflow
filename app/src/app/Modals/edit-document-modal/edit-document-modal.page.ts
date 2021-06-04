import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { DocumentService } from './../../Services/document.service';

@Component({
  selector: 'app-edit-document-modal',
  templateUrl: './edit-document-modal.page.html',
  styleUrls: ['./edit-document-modal.page.scss'],
})
export class EditDocumentModalPage implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private modal: ModalController,
    private docService: DocumentService
  ) {}

  docForm: FormGroup;
  ngOnInit() {
    this.docForm = this.formBuilder.group({
      docName: ['', [Validators.required]],
      documentDescription: ['', [Validators.required]],
      documentStatus: ['', [Validators.required]],
      documentType: ['', [Validators.required]],
    });
  }

  dismissModal() {
    this.modal.dismiss();
  }

  async editDocument() {
    console.log(await this.docService.getDocuments(1));
    let formCopy = this.docForm.value;
    console.log(formCopy);
    formCopy.userID = 1;
    await this.docService.addDocument(formCopy);
    this.dismissModal();
  }
}
