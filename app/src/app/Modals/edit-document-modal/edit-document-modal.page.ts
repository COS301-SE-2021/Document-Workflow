import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-edit-document-modal',
  templateUrl: './edit-document-modal.page.html',
  styleUrls: ['./edit-document-modal.page.scss'],
})
export class EditDocumentModalPage implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private modal: ModalController,
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

  }

  public selectDoc(){
    let blob;

  }

  private mimeTypeChecker(name){
    if(name.indexOf('pdf') >= 0){
      return 'application/pdf';
    }//add other mime types that would be required here
  }
}
