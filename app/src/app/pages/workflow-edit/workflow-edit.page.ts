import { TypeModifier } from '@angular/compiler/src/output/output_ast';
import {
  Component,
  ComponentFactoryResolver,
  ElementRef,
  Input,
  OnInit,
  Sanitizer,
  ViewChild,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ActionSheetController,
  IonReorderGroup,
  ModalController,
  Platform,
} from '@ionic/angular';
import { ItemReorderEventDetail } from '@ionic/core';
import { DocumentActionAreaComponent } from 'src/app/components/document-action-area/document-action-area.component';
import { User, UserAPIService } from 'src/app/Services/User/user-api.service';
import * as Cookies from 'js-cookie';
import {
  phaseFormat,
  phaseUserFormat,
  workflowFormat,
  WorkFlowService,
} from 'src/app/Services/Workflow/work-flow.service';

import { formattedError } from '@angular/compiler';

@Component({
  selector: 'app-workflow-edit',
  templateUrl: './workflow-edit.page.html',
  styleUrls: ['./workflow-edit.page.scss'],
})
export class WorkflowEditPage implements OnInit {
  @Input('workflowID') workflowId: string;
  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  workflowForm: FormGroup;
  private userCount = 1;
  phases: FormArray;
  file: File;

  validat: boolean;

  ready: boolean;
  addFile: boolean;
  addName: boolean;
  addDescription: boolean;

  reOrder: boolean;

  srcFile: any;
  rotated: number;
  setZoom: any;
  zoomLevel: number;

  blob: Blob;

  next: boolean;
  user: User;
  ownerEmail: any;
  sizeMe: boolean;
  controller: boolean;

  phaseViewers: boolean[] = [];

  document: workflowFormat;
  originalFile: File;

  constructor(
    private plat: Platform,
    private fb: FormBuilder,
    private actionSheetController: ActionSheetController,
    private modal: ModalController,
    private route: ActivatedRoute,
    private router: Router,
    private userApiService: UserAPIService,
    private sanitizer: DomSanitizer,
    private workflowServices: WorkFlowService
  ) {}

  async ngOnInit() {
    if (Cookies.get('token') === undefined) {
      await this.router.navigate(['/login']);
      return;
    } else {
      this.userApiService.checkIfAuthorized().subscribe(
        (response) => {
          console.log('Successfully authorized user');
        },
        async (error) => {
          console.log(error);
          await this.router.navigate(['/login']);
          return;
        }
      );
    }
    if (this.plat.width() > 572) {
      this.sizeMe = false;
    } else {
      this.sizeMe = true;
    }

    this.assignVariable();

    await this.route.params.subscribe((data) => {
      this.workflowId = data['workflowId'];
    });

    await this.getWorkflowData();

    await this.getUser();

    await this.workflowServices.getOriginalDocument(
      this.workflowId,
      (response) => {
        console.log('Got the original document');
        const arr = new Uint8Array(response.data.filedata.Body.data);
        const blob = new Blob([arr], { type: 'application/pdf' });
        this.originalFile = new File([blob], response.data.metadata.name);
        console.log(response);
      }
    );
  }
  //todo add workflowId
  async getWorkflowData() {
    await this.workflowServices.retrieveWorkflow(
      this.workflowId,
      async (response) => {
        console.log(response.data);
        let i: number = 0;
        let phases: phaseFormat[] = [];
        for (let phase of response.data.phases) {
          let tmpShow = false;
          if (phase.status === 'Pending') {
            tmpShow = true;
          }
          let tmpPhase: phaseFormat;
          let tempUser: phaseUserFormat[] = [];
          for (let user of JSON.parse(phase.users)) {
            let tmpUser: phaseUserFormat;
            let tmpB: boolean = true;
            if (user['accepted'] === 'false') {
              tmpB = false;
            }
            tmpUser = {
              email: user['user'],
              permission: user['permission'],
              accepted: tmpB,
            };
            tempUser.push(tmpUser);
          }
          console.log(phase);
          tmpPhase = {
            showPhase: tmpShow,
            phaseNumber: i,
            annotations: phase.annotations,
            description: phase.description,
            status: phase.status,
            users: tempUser,
            _id: phase._id,
          };
          phases.push(tmpPhase);
        }
        i++;

        this.document = {
          currentPercent: 0,
          currentPhase: response.data.currentPhase,
          description: response.data.description,
          name: response.data['name'],
          ownerEmail: response.data.ownerEmail,
          ownerId: response.data.ownerId,
          _v: response.data._v,
          _id: response.data._id,
          phases: phases,
        };
        await this.setDocumentData();
        this.ready = true;
      }
    );
  }
  //  workflow id -> "611661feb394bb1d4cc91f3e"

  async setDocumentData() {
    (this.workflowForm = this.fb.group({
      workflowName: [this.document.name, [Validators.required]],
      workflowDescription: [this.document.description, [Validators.required]],
      workflowFile: ['', [Validators.required]],
      phases: this.fb.array([]),
    })),
      this.fillPhases();
  }

  fillPhases() {
    let i = 0;
    for (let phase of this.document.phases) {
      this.workflowForm.controls.phases['controls'].push(this.fillPhase(phase));
      for (let user of phase.users) {
        this.workflowForm.controls.phases['controls'][i].controls.users[
          'controls'
        ].push(this.fillUser(user));
      }
      this.phaseViewers.push(false);
      i++;
    }
  }

  fillPhase(phase: phaseFormat): FormGroup {
    return this.fb.group({
      description: new FormControl(phase.description, Validators.required),
      annotations: new FormControl(phase.annotations, [Validators.required]),
      phaseStatus: new FormControl('Edit'),
      showPhases: new FormControl(phase.showPhase),
      phaseNumber: new FormControl(phase.phaseNumber),
      _id: new FormControl(phase._id),
      users: this.fb.array([]),
    });
  }

  fillUser(user: phaseUserFormat): FormGroup {
    return this.fb.group({
      user: new FormControl(user.email, [
        Validators.email,
        Validators.required,
      ]),
      permission: new FormControl(user.permission, [Validators.required]),
      accepted: new FormControl(user.accepted, [Validators.required]),
    });
  }

  async getUser() {
    await this.userApiService.getUserDetails(async (response) => {
      if (response) {
        this.user = response.data;
        this.ownerEmail = this.user.email;
      } else {
        this.userApiService.displayPopOver('Error', 'Cannot find user');
      }
    });
  }

  checkStatus() {
    if (this.workflowForm.get('workflowName').valid) {
      this.addName = true;
    } else {
      this.addName = false;
    }
    if (this.workflowForm.get('workflowDescription').valid) {
      this.addDescription = true;
    } else {
      this.addDescription = false;
    }
  }

  changeController() {
    this.controller = !this.controller;
  }

  changeOver() {
    this.next = !this.next;
  }

  addUser(form: FormArray, i: number) {
    form.push(this.createNewUser());
  }

  createNewUser(): FormGroup {
    return this.fb.group({
      user: new FormControl('', [Validators.email, Validators.required]),
      permission: new FormControl('', [Validators.required]),
      accepted: new FormControl(false, [Validators.required]),
    });
  }

  removeUser(control: FormArray, i: number, j: number) {
    if (control.length > 1) {
      control.removeAt(j);
    } else {
      if (this.workflowForm.controls.phases['controls'].length > 1) {
        this.removePhase(i, this.workflowForm.get('phases')[i]);
      } else {
        this.userApiService.displayPopOver(
          'Error',
          'you need at least one user and phase'
        );
      }
    }
  }

  changePermission(control: any, str: string, i: number) {
    control.setValue(str);
  }

  createPhase(i: number): FormGroup {
    return this.fb.group({
      description: new FormControl('', Validators.required),
      annotations: new FormControl('', [Validators.required]),
      phaseStatus: new FormControl('Create'),
      showPhases: new FormControl(true),
      phaseNumber: new FormControl(i),
      _id: new FormControl(''),
      users: this.fb.array([
        this.fb.group({
          user: new FormControl('', [Validators.email, Validators.required]),
          permission: new FormControl('', [Validators.required]),
          accepted: new FormControl(false, [Validators.required]),
        }),
      ]),
    });
  }

  addPhase() {
    let phase = this.workflowForm.get('phases') as FormArray;
    phase.push(this.createPhase(phase.length)); //was + 1 but then it seems we skip a phaseNumber
  }

  removePhase(i: number, phas: phaseFormat) {
    let phase = this.workflowForm.get('phases') as FormArray;
    if (phase.at(i)['controls'].phaseStatus.value === 'Create') {
      phase.removeAt(i);
    } else {
      phase.at(i)['controls'].phaseStatus.setValue('Delete');
      phase.at(i)['controls'].showPhases = false;
    }
    console.warn(this.workflowForm);
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

  async uploadFile(event: EventTarget) {
    const eventObj: MSInputMethodContext = event as MSInputMethodContext;
    const target: HTMLInputElement = eventObj.target as HTMLInputElement;
    if (this.plat.is('desktop')) {
    }
    this.file = target.files[0];
    console.log(typeof this.file);
    console.log('file', this.file.arrayBuffer());
    // const buff = response.data.filedata.Body.data; //wut
    const a = new Uint8Array(await this.file.arrayBuffer());
    this.srcFile = a;
    //todo
    this.workflowForm.get('workflowFile').setValue(this.file);
    this.blob = new Blob([this.file], { type: 'application/pdf;base64' });
    console.log(this.blob.arrayBuffer());
    const obj = URL.createObjectURL(this.blob);
    console.log(obj);
    this.srcFile = this.sanitizer.bypassSecurityTrustResourceUrl(obj);
    this.addFile = true;
  }

  fixOrder(ev: CustomEvent<ItemReorderEventDetail>) {
    let phase = this.workflowForm.get('phases') as FormArray;
    let a = phase.controls.splice(ev.detail.from, 1);
    phase.controls.splice(ev.detail.to, 0, a[0]);
    ev.detail.complete();
  }

  reOrderTime() {
    this.reOrder = !this.reOrder;
  }

  debug(str: any) {
    console.log(this.workflowForm);
  }

  async includeActionArea(i: number, form: FormControl) {
    const a = await this.modal.create({
      component: DocumentActionAreaComponent,
      componentProps: {
        file: this.originalFile,
        ownerEmail: this.ownerEmail,
        phaseNumber: i,
      },
    });

    await (await a).present();
    (await a).onDidDismiss().then(async (data) => {
      const result = (await data).data['xfdfString'];
      if (result) {
        console.log(result);
        form.setValue(result);
      } else {
        //not delete
      }
    });
  }

  checkIfValid(): boolean {
    let temp: boolean = true;
    for (let phase of this.workflowForm.controls.phases['controls']) {
      if (phase.controls.phaseStatus.value !== 'Delete') {
        if (phase.status !== 'VALID') {
          temp = false;
        }
      }
    }
    return temp;
  }

  submit() {
    if (this.checkIfValid()) {
      this.userApiService.displayPopOverWithButtons(
        'Edited document',
        'Are you happy with your changes?',
        async (response) => {
          if (response.data.confirm) {
            await this.saveChangesToWorkflow();
          }
        }
      );
    } else {
      this.userApiService.displayPopOver(
        'Error in form',
        'The form is incomplete'
      );
    }
  }

  async saveChangesToWorkflow() {
    let phases: phaseFormat[] = [];
    // console.warn(tmp);
    let i: number = 0;
    console.log(this.document.currentPhase);
    for (let phase of this.workflowForm.controls.phases['controls']) {
      if (this.document.currentPhase < i) {
        let tmpPhase: phaseFormat;
        let tmpUsr: phaseUserFormat[] = [];
        console.log(phase.controls.users['controls']);
        for (let user of phase.controls.users['controls']) {
          let tempUser: phaseUserFormat;
          tempUser = {
            email: user.controls.user.value,
            permission: user.controls.permission.value,
            accepted: user.controls.accepted.value,
          };
          tmpUsr.push(tempUser);
        }
        console.log(phase.controls._id.value);
        tmpPhase = {
          status: phase.controls.phaseStatus.value,
          annotations: phase.controls.annotations.value,
          description: phase.controls.description.value,
          _id: phase.controls._id.value,
          users: tmpUsr,
        };
        phases.push(tmpPhase);
      }
      i++;
    }
    const name = this.workflowForm.controls.workflowName.value;
    const description = this.workflowForm.controls.workflowDescription.value;

    // await this.workflowServices.editWorkflow(
    //   name,
    //   description,
    //   phases,
    //   this.workflowId,
    //   (response) => {
    //     console.log(response);
    //   }
    // );
  }

  viewPhase(i: number) {
    this.phaseViewers[i] = !this.phaseViewers[i];
  }

  printForm() {
    console.log(this.workflowForm);
  }

  assignVariable() {
    this.next = false;
    this.rotated = 0;
    this.setZoom = 'false';
    this.zoomLevel = 1;

    this.reOrder = true;

    this.addFile = false;
    this.addDescription = false;
    this.addName = false;
    this.controller = false;

    this.ready = false;
  }
}
