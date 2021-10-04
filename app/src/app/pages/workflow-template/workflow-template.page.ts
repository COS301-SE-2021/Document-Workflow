import { Component, ElementRef, Input, OnInit, ViewChild, ViewChildren } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonSelect, ModalController, Platform } from '@ionic/angular';
import WebViewer from '@pdftron/webviewer';
import { DocumentActionAreaComponent } from 'src/app/components/document-action-area/document-action-area.component';
import { AIService } from 'src/app/Services/AI/ai.service';
import { Logger } from 'src/app/Services/Logger';
import { UserAPIService } from 'src/app/Services/User/user-api.service';
import { VerifyEmail } from 'src/app/Services/Validators/verifyEmail.validator';
import {
  phaseFormat,
  WorkFlowService,
} from 'src/app/Services/Workflow/work-flow.service';
import {
  WorkflowTemplateService,
  templateDescription,
  templatePhaseUser,
} from 'src/app/Services/WorkflowTemplate/workflow-template.service';

@Component({
  selector: 'app-workflow-template',
  templateUrl: './workflow-template.page.html',
  styleUrls: ['./workflow-template.page.scss'],
})
export class WorkflowTemplatePage implements OnInit {
  @ViewChildren('selectContact') selectContact: IonSelect;
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  @ViewChild('viewer') viewerRef: ElementRef;
  sizeMe: boolean;
  templateForm: FormGroup;
  readyForPhase2: boolean = false;
  phase2: boolean = true;
  tempDesc: templateDescription[] = [];
  phaseViewers: boolean[] = [];
  originalFile: any;
  ownerEmail: string;
  file: File;
  blob: Blob;
  srcFile: any;

  contacts: string[] = [];

  constructor(
    private fb: FormBuilder,
    private plat: Platform,
    private workflowService: WorkFlowService,
    private templateService: WorkflowTemplateService,
    private userService: UserAPIService,
    private route: ActivatedRoute,
    private router: Router,
    private logger: Logger,
    private modal: ModalController,
  ) {}

  async ngOnInit() {
    if (this.plat.width() > 572) {
      this.sizeMe = false;
    } else {
      this.sizeMe = true;
    }

    await this.getTemplateData();
  }

  async getTemplateData() {
    this.workflowService.displayLoading();
    this.userService.getTemplateIDs(async (response) => {
      for (let id of response.data.templateIds) {
        await this.getWorkflowTemplateData(id);
      }
      this.workflowService.dismissLoading();
    });
  }

  async getWorkflowTemplateData(id: string) {
    this.templateService.getWorkflowTemplateNameAndDescription(
      id,
      (response) => {
        let tmp: templateDescription;
        tmp = {
          templateID: id,
          templateName: response.templateName,
          templateDescription: response.templateDescription,
        };
        this.tempDesc.push(tmp);
      }
    );
  }

  async useThisTemplate(id: string) {
    await this.templateService.getWorkflowTemplateData(id, async (response) => {
      let template = response.template;
      this.ownerEmail = template.templateOwnerEmail;
      this.originalFile = response.fileData;

      this.templateForm = this.fb.group({
        workflowName: [template.workflowName, [Validators.required]],
        workflowDescription: [
          template.workflowDescription,
          [Validators.required],
        ],
        phases: this.fb.array([]),
      });
      this.fillPhases(template.phases);

      this.readyForPhase2 = true;
      const arr = new Uint8Array(this.originalFile.Body.data);
      this.blob = new Blob([arr], { type: 'application/pdf;base64' });
      this.file = new File([this.blob], template.documentName);
      await this.getContacts();
    });
  }

  displayWebViewer() {

    WebViewer(
      {
        path: './../../../assets/lib',
        fullAPI: true,
      },
      this.viewerRef.nativeElement
    ).then(async (instance) => {
      instance.Core.PDFNet.initialize();

      instance.UI.loadDocument(this.blob, { filename: 'Preview Document' });
      instance.UI.disableElements(['ribbons']);
      instance.UI.setToolbarGroup('toolbarGroup-View', false);

      instance.Core.documentViewer.addEventListener(
        'documentLoaded',
        async () => {}
      );
    });
  }

  fillPhases(phases: any) {
    for (let phase of phases) {
      this.templateForm.controls.phases['controls'].push(this.fillPhase(phase));
    }
  }

  viewPhase(i: number) {
    this.phaseViewers[i] = !this.phaseViewers[i];
  }

  fillPhase(phase: phaseFormat) {
    this.phaseViewers.push(false);
    let temp = this.fb.group({
      annotations: [phase.annotations, [Validators.required]],
      description: [phase.description, [Validators.required]],
      status: [phase.status, [Validators.required]],
      users: this.fb.array([]),
    });

    for (let user of phase.users) {
      temp.controls.users['controls'].push(this.fillUsers(user));
    }

    return temp;
  }

  fillUsers(user: any) {
    const verifierEmail = new VerifyEmail(this.userService);
    return this.fb.group({
      user: [
        user.user,
        [
          Validators.email,
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
        // [verifierEmail.verifyEmail.bind(verifierEmail)],
      ],
      permission: [user.permission, [Validators.required]],
      accepted: [user.accepted, [Validators.required]],
    });
  }

  async nextPhase() {
    this.phase2 = !this.phase2;
  }

  addUser(form: FormArray, i: number) {
    form.push(this.createNewUser());
  }

  createNewUser(): FormGroup {
    const verifierEmail = new VerifyEmail(this.userService);
    return this.fb.group({
      user: new FormControl(
        '',
        [
          Validators.email,
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
        // [verifierEmail.verifyEmail.bind(verifierEmail)]
      ),
      permission: new FormControl('', [Validators.required]),
      accepted: new FormControl('false', [Validators.required]),
    });
  }

  removeUser(control: FormArray, i: number, j: number) {
    if (control.length > 1) {
      control.removeAt(j);
    } else {
      if (this.templateForm.controls.phases['controls'].length > 1) {
        this.removePhase(i, this.templateForm.get('phases')[i]);
      } else {
        this.userService.displayPopOver(
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
    const verifierEmail = new VerifyEmail(this.userService);
    return this.fb.group({
      description: new FormControl('', Validators.required),
      annotations: new FormControl('', [Validators.required]),
      status: new FormControl('Pending', [Validators.required]),
      users: this.fb.array([
        this.fb.group({
          user: new FormControl(
            '',
            [
              Validators.email,
              Validators.required,
              Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
            ],
            // [verifierEmail.verifyEmail.bind(verifierEmail)]
          ),
          permission: new FormControl('', [Validators.required]),
          accepted: new FormControl('false', [Validators.required]),
        }),
      ]),
    });
  }

  addPhase() {
    let phase = this.templateForm.get('phases') as FormArray;
    phase.push(this.createPhase(phase.length)); //was + 1 but then it seems we skip a phaseNumber
  }

  removePhase(i: number, phas: phaseFormat) {
    let phase = this.templateForm.get('phases') as FormArray;
    phase.removeAt(i);
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

    let template = null;
    if (this.templateForm.controls.templateName !== undefined) {
      template = {
        templateName: this.templateForm.controls.templateName.value,
        templateDescription:
          this.templateForm.controls.templateDescription.value,
      };
    }

    const phases = this.templateForm.controls.phases.value;
    const name = this.templateForm.controls.workflowName.value;
    const description = this.templateForm.controls.workflowDescription.value;
    await this.workflowService.createWorkflow(
      name,
      description,
      phases,
      this.file,
      template,
      (response) => {
        if (response.status === 'success') {
          this.userService.displayPopOver(
            'Success',
            'You have successfully created a workflow'
          );
          this.router.navigate(['/home']);
        } else {
          this.userService.displayPopOver(
            'Error',
            'Something has gone wrong, please try again'
          );
        }
      }
    );
  }

  async addFriend(i: number, j: number) {
    let b: string = i + ' ' + j;
    for (let comp of this.selectContact['_results']) {
      if (b === comp['name']) {
        comp.open();
      }
    }
  }

  async friendChosen(form: FormControl, i: number, j: number) {
    let b: string = i + ' ' + j;
    for (let comp of this.selectContact['_results']) {
      if (b === comp['name']) {
        form.setValue(comp.value);
      }
    }
  }

  async getContacts() {
    await this.userService.getContacts((response) => {
      if (response) {
        if (response.status === 'success') {
          this.contacts = response.data.contacts;
          this.contacts.push(this.ownerEmail);
        } else {
          this.userService.displayPopOver('Error', 'Failed to get users');
        }
      }
    });
  }

  debug(b) {
  }

  deleteTemplate(id: string){
    this.templateService.deleteWorkflowTemplate(id, async (response)=>{

      this.tempDesc = [];
      await this.getTemplateData();
      await this.templateService.displayPopOver('Success', 'The workflow template was successfully deleted');
    });
  }
}
