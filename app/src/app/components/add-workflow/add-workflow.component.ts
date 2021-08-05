/* eslint-disable @typescript-eslint/member-ordering */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  AbstractControl
} from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {
  ActionSheetController,
  IonReorderGroup,
  ModalController,
  Platform,
} from '@ionic/angular';
import { ItemReorderEventDetail } from '@ionic/core';

import { DocumentViewPageRoutingModule } from 'src/app/pages/document-view/document-view-routing.module';

@Component({
  selector: 'app-add-workflow',
  templateUrl: './add-workflow.component.html',
  styleUrls: ['./add-workflow.component.scss'],
})
export class AddWorkflowComponent implements OnInit {
  workflowForm: FormGroup;
  private userCount = 1;
  private phaseNumber: number[];
  phases: FormArray;
  file: File;
  addFile: boolean;
  reOrder: boolean;

  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  constructor(
    private plat: Platform,
    private fb: FormBuilder,
    private actionSheetController: ActionSheetController,
    private modal: ModalController
  ) {}

  ngOnInit() {
    this.reOrder = true;
    this.addFile = false;
    this.phaseNumber = Array(1)
      .fill(0)
      .map((x, i) => i);
    this.workflowForm = this.fb.group({
      workflowName: ['', [Validators.required]],
      workflowDescription: ['', [Validators.required]],
      phases: this.fb.array([
        this.fb.group({
          user1: new FormControl('', [Validators.email, Validators.required]),
        }),
      ]),
    });
    // console.log(this.workflowForm.controls.phases['controls'][0]);
  }

  addUser(form: FormGroup) {
    this.userCount = this.userCount + 1;
    form.addControl(
      'user' + this.userCount,
      new FormControl('', [Validators.email, Validators.required])
    );
  }

  removeUser(form: FormGroup, control) {
    form.removeControl(control.key);
  }

  createPhase(): FormGroup {
    return this.fb.group({
      user1: new FormControl('', [Validators.email, Validators.required]),
    });
  }

  addPhase() {
    this.phaseNumber.push(0);
    let phase = this.workflowForm.get('phases') as FormArray;
    phase.push(this.createPhase());
  }

  removePhase( i: number){
    this.phaseNumber.pop();
    let phase = this.workflowForm.get('phases') as FormArray;
    phase.removeAt(i);
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

  submit() {
    this.modal.dismiss({
      document: this.workflowForm.value,
      file: this.file,
    });
  }

  fixOrder(ev: CustomEvent<ItemReorderEventDetail>){
    let phase = this.workflowForm.get('phases') as FormArray;
    let a = phase.controls.splice(ev.detail.from,1);
    phase.controls.splice(ev.detail.to, 0, a[0] );
    ev.detail.complete();
  }

  reOrderTime(){
    this.reOrder = !this.reOrder;
  }
}
