import { Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { FormGroup, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {
  ActionSheetController,
  ModalController,
  Platform,
} from '@ionic/angular';

import { DocumentViewPageRoutingModule } from 'src/app/pages/document-view/document-view-routing.module';
import { WorkFlowService } from 'src/app/Services/Workflow/work-flow.service';
import { ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-edit-workflow',
  templateUrl: './edit-workflow.component.html',
  styleUrls: ['./edit-workflow.component.scss'],
})
export class EditWorkflowComponent implements OnInit {
  workflowForm: FormGroup;
  private userCount = 1;
  private phaseNumber: number[];
  phases: FormArray;
  file: File;
  addFile: boolean;
  ready = false;

  @Input() workflowID: string;

  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  constructor(
    private plat: Platform,
    private fb: FormBuilder,
    private actionSheetController: ActionSheetController,
    private modal: ModalController,
    private workflowServices: WorkFlowService
  ) {}

  async ngOnInit() {
    await this.workflowServices.getWorkFlowData(this.workflowID, async  (response) => {
      if (response) {

       let data = await response.data;
        console.log(data);
        this.phaseNumber = Array(1)
          .fill(0)
          .map((x, i) => i);

        this.workflowForm = this.fb.group({
          workflowName: [data.name, [Validators.required]],
          workflowDescription: ['', [Validators.required]],
          phases: this.fb.array([

          ]),
        });
        this.fillForms(data);
        this.ready = true;
      } else {
      }
    });
    // console.log(this.workflowForm.controls.phases['controls'][0]);
  }

  fillForms(data){
    if(data){
      for(let b of data.phases){
        if(b.indexOf(',') != -1){
          let a = b.toString().split(',');
          console.log(a);
        }else{
          console.log(b.toString());
          this.phaseNumber.push(0);
          let phase = this.workflowForm.get('phases') as FormArray;
          phase.push(this.createPhaseInit(b.toString()));
        }
      }
    }
  }


  createPhaseInit(email: string){
    this.userCount = this.userCount + 1;
    return this.fb.group({
      user1: new FormControl(email, [Validators.email, Validators.required]),
    });
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
    this.userCount = this.userCount + 1;
    let bobs = 'user' + this.userCount;
    return this.fb.group({
      user1: new FormControl('', [Validators.email, Validators.required]),
    });
  }

  addPhase() {
    this.phaseNumber.push(0);
    let phase = this.workflowForm.get('phases') as FormArray;
    phase.push(this.createPhase());
  }

  removePhase(i: number) {
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

  async getData() {
    this.workflowServices.getWorkFlowData(this.workflowID, (response) => {
      if (response) {
        console.log(response.data);
      } else {
      }
    });
  }

  submit() {
    this.modal.dismiss({
      document: this.workflowForm.value,
      file: this.file,
    });
  }
}
