import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validator, Validators } from '@angular/forms';
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
      documentName: ['', [Validators.required]],
      documentDescription: ['', [Validators.required]],
      status: ['', [Validators.required]],
      type: ['', [Validators.required]],
    });
  }

  dismissModal() {
    this.modal.dismiss();
  }

  async addDocument(){
    let formCopy = this.docForm.value;
    console.log(formCopy);
    formCopy.userID = this.user.id;
    await this.docService.addDocument(formCopy)
  }
}
