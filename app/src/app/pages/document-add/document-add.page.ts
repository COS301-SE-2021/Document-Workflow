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
  AbstractControlOptions,
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
import { verifyEmail } from 'src/app/Services/Validators/verifyEmail.validator';
import { validateLocaleAndSetLanguage } from 'typescript';

@Component({
  selector: 'app-document-add',
  templateUrl: './document-add.page.html',
  styleUrls: ['./document-add.page.scss'],
})
export class DocumentAddPage implements OnInit {
  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  workflowForm: FormGroup;
  userCount = 1;
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
  sizeMe: boolean;

  showPhase: boolean[] = [];

  controller: boolean;
  constructor(
    private plat: Platform,
    private fb: FormBuilder,
    private actionSheetController: ActionSheetController,
    private modal: ModalController,
    private router: Router,
    private userApiService: UserAPIService,
    private sanitizer: DomSanitizer,
    private workflowService: WorkFlowService
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

    const formOptions: AbstractControlOptions = {
      validators: verifyEmail('user', this.userApiService),
    };

    this.next = false;
    this.rotated = 0;
    this.setZoom = 'false';
    this.zoomLevel = 1;

    this.reOrder = true;

    this.addFile = false;
    this.addDescription = false;
    this.addName = false;
    this.controller = false;

    this.workflowForm = this.fb.group({
      workflowName: ['', [Validators.required]],
      workflowDescription: ['', [Validators.required]],
      workflowFile: ['', [Validators.required]],
      phases: this.fb.array([
        this.fb.group({
          annotations: new FormControl('', [Validators.required]),
          description: new FormControl('', Validators.required),
          users: this.fb.array([
            this.fb.group({
              user: new FormControl('', [
                Validators.email,
                Validators.required,
                Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")
              ]),
              permission: new FormControl('', [Validators.required]),
              accepted: new FormControl('false', [Validators.required]),
            }),
          ]),
        }),
      ]),
    });
    this.showPhase.push(true);
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

  addUser(form: FormArray) {
    form.push(this.createNewUser());
  }

  createNewUser(): FormGroup {
    const formOptions: AbstractControlOptions = {
      validators: verifyEmail('user', this.userApiService),
    };
    return this.fb.group({
      user: new FormControl('', [Validators.email, Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]),
      permission: new FormControl('', [Validators.required]),
      accepted: new FormControl('false', [Validators.required]),
    });
  }

  removeUser(control: FormArray, i: number, j: number) {
    if (control.length > 1) {
      control.removeAt(j);
    } else {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      if (this.workflowForm.controls.phases['controls'].length > 1) {
        this.removePhase(i);
      } else {
        this.userApiService.displayPopOver(
          'Error',
          'you need at least one user and phase'
        );
      }
    }
  }

  changePermission(control: any, str: string) {
    control.setValue(str);
  }

  createPhase(): FormGroup {
    const formOptions: AbstractControlOptions = {
      validators: verifyEmail('user', this.userApiService),
    };
    return this.fb.group({
      description: new FormControl('', Validators.required),
      annotations: new FormControl('', [Validators.required]),
      users: this.fb.array([
        this.fb.group({
          user: new FormControl('', [
            Validators.email,
            Validators.required,
            , Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")
          ]),
          permission: new FormControl('', [Validators.required]),
          accepted: new FormControl('false', [Validators.required]),
        } ),
      ]),
    });
  }

  addPhase() {
    const phase = this.workflowForm.get('phases') as FormArray;
    phase.push(this.createPhase());
    this.showPhase.push(true);
  }

  removePhase(i: number) {
    const phase = this.workflowForm.get('phases') as FormArray;
    if (phase.length > 1) {
      phase.removeAt(i);
      this.showPhase.splice(i,1);
    } else {
      this.userApiService.displayPopOver(
        'Error',
        'you need at least one user and phase'
      );
    }
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

    if (this.plat.is('desktop')) {
      this.fileInput.nativeElement.click();
    } else {
      const actionSheet = await this.actionSheetController.create({
        header: 'Select PDF',
        buttons,
      });

      await actionSheet.present();
    }
  }

  async uploadFile(event: EventTarget) {
    const eventObj: MSInputMethodContext = event as MSInputMethodContext;
    const target: HTMLInputElement = eventObj.target as HTMLInputElement;
    this.file = target.files[0];
    console.log(typeof this.file);
    console.log('file', await this.file.arrayBuffer());
    // const buff = response.data.filedata.Body.data; //wut
    const a = new Uint8Array(await this.file.arrayBuffer());
    this.srcFile = a;

    this.workflowForm.get('workflowFile').setValue(this.file);
    this.blob = new Blob([this.file], { type: 'application/pdf;base64' });
    console.log(this.blob.arrayBuffer());
    const obj = URL.createObjectURL(this.blob);
    console.log(obj);
    this.srcFile = this.sanitizer.bypassSecurityTrustResourceUrl(obj);
    this.addFile = true;
  }

  fixOrder(ev: CustomEvent<ItemReorderEventDetail>) {
    const phase = this.workflowForm.get('phases') as FormArray;
    const a = phase.controls.splice(ev.detail.from, 1);
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
      // eslint-disable-next-line @typescript-eslint/dot-notation
      const result = (await data).data['xfdfString'];
      if (result) {
        form.setValue(result);
      } else {
        //not delete
      }
    });
  }

  async submit() {
    await this.createWorkflow();
  }

  async createWorkflow() {
    this.workflowService.displayLoading();
    console.log('Extracting form data ------------------------------');
    console.log('Name: ', this.workflowForm.controls.workflowName.value);
    console.log(
      'Description: ',
      this.workflowForm.controls.workflowDescription.value
    );
    console.log(this.workflowForm);

    const phases = this.workflowForm.controls.phases.value;
    const name = this.workflowForm.controls.workflowName.value;
    const description = this.workflowForm.controls.workflowDescription.value;
    this.workflowService.createWorkflow(
      name,
      description,
      phases,
      this.file,
      (response) => {
        this.workflowService.dismissLoading();
        if(response.status === 'success'){
          this.userApiService.displayPopOver('Success','You have successfully created a workflow');
          this.router.navigate(['/home']);
        }else{
          this.userApiService.displayPopOver('Error','something has gone wrong, please try again');
          this.router.navigate(['/home']);
        }
      }
    );
  }

  printForm() {
    console.log(this.workflowForm);
  }

  toggleVisibility(i: number){
    this.showPhase[i] = !this.showPhase[i];
  }
}
