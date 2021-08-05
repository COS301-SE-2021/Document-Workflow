import { TypeModifier } from '@angular/compiler/src/output/output_ast';
import {
  Component,
  ElementRef,
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
import { Router } from '@angular/router';
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
import { WorkFlowService } from 'src/app/Services/Workflow/work-flow.service';
@Component({
  selector: 'app-add-workflow',
  templateUrl: './add-workflow.page.html',
  styleUrls: ['./add-workflow.page.scss'],
})
export class AddWorkflowPage implements OnInit {
  workflowForm: FormGroup;
  private userCount = 1;
  private phaseNumber: number[];
  phases: FormArray;
  file: File;

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

  controller: boolean;

  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  constructor(
    private plat: Platform,
    private fb: FormBuilder,
    private actionSheetController: ActionSheetController,
    private modal: ModalController,
    private router: Router,
    private userApiService: UserAPIService,
    private sanitizer: DomSanitizer,
    private workflowServices: WorkFlowService,
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

    this.next = false;
    this.rotated = 0;
    this.setZoom = 'false';
    this.zoomLevel = 1;

    this.reOrder = true;

    this.addFile = false;
    this.addDescription = false;
    this.addName = false;
    this.controller = false;

    this.phaseNumber = Array(1)
      .fill(0)
      .map((x, i) => i);
    this.workflowForm = this.fb.group({
      workflowName: ['', [Validators.required]],
      workflowDescription: ['', [Validators.required]],
      phases: this.fb.array([
        this.fb.group({
          xfsdString: new FormControl('', [Validators.required]),
          user1: new FormControl('', [Validators.email, Validators.required]),
          permission1: new FormControl('', [Validators.required]),
        }),
      ]),
    });
    // console.log(this.workflowForm.controls.phases['controls'][0]);
    await this.getUser();
  }

  async getUser() {
    await this.userApiService.getUserDetails(async (response) => {
      if (response) {
        this.user = response.data;
        this.ownerEmail = this.user.email;
        console.log(this.ownerEmail);
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

  addUser(form: FormGroup) {
    this.userCount = this.userCount + 1;
    form.addControl(
      'user' + this.userCount,
      new FormControl('', [Validators.email, Validators.required])
    );
    form.addControl(
      'permission' + this.userCount,
      new FormControl('', [Validators.required])
    );
  }

  findNumber(key: string): number {
    let length;
    if (key.length > 10) {
      length = key.substring(10, key.length);
    } else {
      length = key.substring(4, key.length);
    }
    return length;
  }

  removeUser(form: FormGroup, control) {
    let length = this.findNumber(control.key);
    form.removeControl('user' + length);
    form.removeControl('permission' + length);
  }

  changePermission(form: FormGroup, control: any, str: string) {
    let num = this.findNumber(control.key);
    switch (str) {
      case 'edit':
        form.get('permission'+num).setValue('sign');
        break;
      case 'view':
        form.get('permission'+num).setValue('view');
        break;
    }
  }

  createPhase(): FormGroup {
    return this.fb.group({
      user1: new FormControl('', [Validators.email, Validators.required]),
      permission1: new FormControl('', [Validators.required]),
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

  async uploadFile(event: EventTarget) {
    const eventObj: MSInputMethodContext = event as MSInputMethodContext;
    const target: HTMLInputElement = eventObj.target as HTMLInputElement;
    this.file = target.files[0];
    console.log(typeof this.file);
    console.log('file', this.file.arrayBuffer());
    // const buff = response.data.filedata.Body.data; //wut
    const a = new Uint8Array(await this.file.arrayBuffer());
    this.srcFile = a;

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

  async includeActionArea(i: number, form: FormGroup) {
    console.log(i);
    const a = await this.modal.create({
      component: DocumentActionAreaComponent,
      componentProps: {
        file: this.blob,
        ownerEmail: this.ownerEmail,
        phaseNumber: i,
      },
    });

    await (await a).present();
    (await a).onDidDismiss().then(async (data) => {
      const result = (await data).data['xfdfString'];
      if (result) {
        form.get('xfsdString').setValue(result);
      } else {
        //not delete
      }
    });
  }

  submit(){
    console.log(this.workflowForm);
    this.workflowServices.createWorkflow(this.workflowForm, '', this.file, (response)=>{

    });
  }
}
    // const addModal = await this.modals.create({
    //   component: AddWorkflowComponent,
    // });

    // (await addModal).present();

    // (await addModal).onDidDismiss().then(async (data) => {
    //   // const users = (await data).data['users'];
    //   const documents = (await data).data['document'];
    //   const file = (await data).data['file'];
    //   let phases = '';
    //   console.log(documents.phases);
    //   for(let i=0; i<documents.phases.length; ++i) //Sending arrays of arrays does not work well in angular so this workaround will have to do.
    //   {
    //     let temp = '[';
    //     for(const [key, value] of Object.entries(documents.phases[i]))
    //       temp+=value + ' ';
    //     phases += temp.substr(0, temp.length-1) +']'; //dont want the trailing space
    //   }
    //   console.log(phases);
    //   const workflowData = {
    //     name: documents.workflowName,
    //     description: documents.workflowDescription
    //   };
    //   this.workFlowService.createWorkflow(workflowData, phases, file, (response) => {
    //     if (response.status === 'success') {
    //       this.userApiService.displayPopOver('Success', 'Workflow has been created');
    //       location.reload();
    //     } else {
    //       console.log(response);
    //       this.userApiService.displayPopOver('Workflow could not be created', response.message);
    //     }
    //   });
    // });
