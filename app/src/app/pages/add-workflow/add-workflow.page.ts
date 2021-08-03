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
import {User, UserAPIService} from 'src/app/Services/User/user-api.service';
import * as Cookies from 'js-cookie';
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

  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  constructor(
    private plat: Platform,
    private fb: FormBuilder,
    private actionSheetController: ActionSheetController,
    private modal: ModalController,
    private router: Router,
    private userApiService: UserAPIService,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    if(Cookies.get('token') === undefined){
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
    await this.getUser();
  }

  async getUser(){
    await this.userApiService.getUserDetails(async (response) => {
      if (response) {
        this.user = response.data;
        this.ownerEmail = this.user.email;
        console.log(this.ownerEmail)
      } else {
        this.userApiService.displayPopOver('Error', 'Cannot find user')
      }
    })
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

  changeOver() {
    this.next = !this.next;
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

  submit() {
    this.modal.dismiss({
      document: this.workflowForm.value,
      file: this.file,
    });
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

  async includeActionArea(i: number) {
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
    const data = (await a).onDidDismiss();
    // this.router.navigate(['addWorkflow/ActionArea', {
    //   file: this.srcFile,
    //   phaseNumber: i
    // }]);
  }
}
