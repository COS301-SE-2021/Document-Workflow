/* eslint-disable @typescript-eslint/member-ordering */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActionSheetController, Platform } from '@ionic/angular';
import { DocumentViewPageRoutingModule } from 'src/app/pages/document-view/document-view-routing.module';

@Component({
  selector: 'app-edit-workflow',
  templateUrl: './edit-workflow.component.html',
  styleUrls: ['./edit-workflow.component.scss'],
})
export class EditWorkflowComponent implements OnInit {


  workflowForm: FormGroup;
  userForm: FormGroup;
  private userCount=1;

  file: File;
  @ViewChild('fileInput', { static: false })fileInput: ElementRef;
  constructor(
    private plat: Platform,
    private fb: FormBuilder,
    private actionSheetController: ActionSheetController
    ) { }

  ngOnInit() {
    this.workflowForm = this.fb.group({
      workflowName: ['',[Validators.required]],
      workflowDescription:['', [Validators.required]],
    });

    this.userForm = this.fb.group({
      user1: ['', [Validators.email, Validators.required]],
      read: ['', [Validators.required]],
      write: ['', [Validators.required]]
    });
  }

  addUser(){
    this.userCount = this.userCount +1;
    this.userForm.addControl('user'+ this.userCount, new FormControl('',[Validators.email,Validators.required]));
  }



  removeUser(control){
    this.userForm.removeControl(control.key);
  }
  submit(){

  }
}