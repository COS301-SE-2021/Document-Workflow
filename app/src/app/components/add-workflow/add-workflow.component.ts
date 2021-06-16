/* eslint-disable @typescript-eslint/member-ordering */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActionSheetController, ModalController, Platform } from '@ionic/angular';
import { DocumentViewPageRoutingModule } from 'src/app/pages/document-view/document-view-routing.module';

@Component({
  selector: 'app-add-workflow',
  templateUrl: './add-workflow.component.html',
  styleUrls: ['./add-workflow.component.scss'],
})
export class AddWorkflowComponent implements OnInit {

  workflowForm: FormGroup;
  userForm: FormGroup;
  private userCount=1;

  file: File;
  @ViewChild('fileInput', { static: false })fileInput: ElementRef;
  constructor(
    private plat: Platform,
    private fb: FormBuilder,
    private actionSheetController: ActionSheetController,
    private modal: ModalController
    ) { }

  ngOnInit() {
    this.workflowForm = this.fb.group({
      workflowName: ['',[Validators.required]],
      workflowDescription:['', [Validators.required]],
    });

    this.userForm = this.fb.group({
      user1: ['', [Validators.email, Validators.required]],
    });
  }

  addUser(){
    this.userCount = this.userCount +1;
    this.userForm.addControl('user'+ this.userCount, new FormControl('',[Validators.email,Validators.required]));
  }



  removeUser(control){
    this.userForm.removeControl(control.key);
  }

  async selectImageSource() {
    const buttons = [
      {
        text: 'Choose a file',
        icon: 'attach',
        handler: () => {
          this.fileInput.nativeElement.click();
        },
      },
    ];

    const actionSheet = await this.actionSheetController.create({
      header: 'Select PDF',
      buttons,
    });

    await actionSheet.present();
  }

  uploadFile(event: EventTarget) {
    const eventObj: MSInputMethodContext = event as MSInputMethodContext;
    const target: HTMLInputElement = eventObj.target as HTMLInputElement;
    this.file = target.files[0];

    console.log('file', this.file);
  }

  submit(){
    this.modal.dismiss({
      users:  this.userForm.value,
      document: this.workflowForm.value,
      file: this.file
    });
  }
}
