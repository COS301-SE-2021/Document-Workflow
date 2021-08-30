import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import WebViewer from '@pdftron/webviewer';
import { DocumentActionAreaComponent } from 'src/app/components/document-action-area/document-action-area.component';
import { AIService } from 'src/app/Services/AI/ai.service';
import { phaseUser } from 'src/app/Services/Document/document-api.service';
import { Logger } from 'src/app/Services/Logger';
import { UserAPIService } from 'src/app/Services/User/user-api.service';
import { phaseFormat, WorkFlowService } from 'src/app/Services/Workflow/work-flow.service';
import { WorkflowTemplateService, templateDescription, templatePhaseUser } from 'src/app/Services/WorkflowTemplate/workflow-template.service';



@Component({
  selector: 'app-workflow-template',
  templateUrl: './workflow-template.page.html',
  styleUrls: ['./workflow-template.page.scss'],
})
export class WorkflowTemplatePage implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  sizeMe: boolean;
  templateForm: FormGroup;
  readyForPhase2: boolean = false;
  phase2: boolean = true;
  tempDesc: templateDescription[]=[];
  phaseViewers: boolean[]=[];
  originalFile:string ;
  ownerEmail:string;
  file:any;
  blob: Blob;
  srcFile: any;
  viewerRef: any;

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
    private aiService: AIService,
  ) { }

  async ngOnInit() {
    if(this.plat.width() > 572){
      this.sizeMe = false;
    }else{
      this.sizeMe = true;
    }

    //todo uncomment the comment
    await this.getTemplateData();
  }

  async getTemplateData(){
    console.log("Fetching template ids");
    this.userService.getTemplateIDs(async (response)=>{
      for(let id of response.data.templateIds){
        await this.getWorkflowTemplateData(id);
      }
    })
  }

  async getWorkflowTemplateData(id: string){
    this.templateService.getWorkflowTemplateNameAndDescription(id, (response)=>{
      let tmp: templateDescription;
      tmp={
        templateID: id,
        templateName: response.templateName,
        templateDescription: response.templateDescription
      }
      this.tempDesc.push(tmp);
    })
  }

  async useThisTemplate(id:string){
    this.templateService.getWorkflowTemplateData(id, (response)=>{
      let template = response.template;
      this.ownerEmail = template.templateOwnerEmail;
      this.originalFile = response.fileData;
      console.log(template)
      this.templateForm = this.fb.group({
        workflowName: [template.workflowName,[Validators.required]],
        workflowDescription: [template.workflowDescription, [Validators.required]],
        phases: this.fb.array([]),
      });
      this.fillPhases(template.phases);
      this.readyForPhase2 = true;
    })
  }

  fillPhases(phases: any){
      for(let phase of phases){
        this.templateForm.controls.phases['controls'].push(this.fillPhase(phase[0]))
      }
  }

  viewPhase(i: number){
    this.phaseViewers[i] = !this.phaseViewers[i];
  }

  fillPhase(phase: phaseFormat){
    this.phaseViewers.push(false);
    let temp  = this.fb.group({
      annotations:[phase.annotations,[Validators.required]],
      description:[phase.description,[Validators.required]],
      status: [phase.status, [Validators.required]],
      users: this.fb.array([])
    });

    for(let user of phase.users){
      temp.controls.users['controls'].push(this.fillUsers(user));
    }

    return temp;
  }

  fillUsers(user: any){
    console.log('here')
    return this.fb.group({
      user:[user.user, [Validators.required, Validators.email]],
      permission:[user.permission,[Validators.required]],
      accepted:[user.accepted,[Validators.required]]
    })
  }

  nextPhase(){
    this.phase2 = !this.phase2;
  }

  addUser(form: FormArray, i: number) {
    form.push(this.createNewUser());
  }

  createNewUser(): FormGroup {
    return this.fb.group({
      user: new FormControl('', [Validators.email, Validators.required]),
      permission: new FormControl('', [Validators.required]),
      accepted: new FormControl("false", [Validators.required]),
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
    return this.fb.group({
      description: new FormControl('', Validators.required),
      annotations: new FormControl('', [Validators.required]),
      status: new FormControl('Pending', [Validators.required]),
      users: this.fb.array([
        this.fb.group({
          user: new FormControl('', [Validators.email, Validators.required]),
          permission: new FormControl('', [Validators.required]),
          accepted: new FormControl("false", [Validators.required]),
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
    if (phase.at(i)['controls'].phaseStatus.value === 'Create') {
      phase.removeAt(i);
    } else {
      phase.at(i)['controls'].phaseStatus.setValue('Delete');
      phase.at(i)['controls'].showPhases = false;
    }
    console.warn(this.templateForm);
  }

  async includeActionArea(i: number, form: FormControl) {
    console.log(this.ownerEmail)
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

  async uploadFile(event: EventTarget) {
    const eventObj: MSInputMethodContext = event as MSInputMethodContext;
    const target: HTMLInputElement = eventObj.target as HTMLInputElement;
    this.file = target.files[0];
    console.log(typeof this.file);
    console.log('file', await this.file.arrayBuffer());
    // const buff = response.data.filedata.Body.data; //wut

    this.srcFile = new Uint8Array(await this.file.arrayBuffer());

    this.templateForm.get('workflowFile').setValue(this.file);
    this.blob = new Blob([this.file], { type: 'application/pdf;base64' });
    console.log(this.blob.arrayBuffer());
    const obj = URL.createObjectURL(this.blob);
    console.log(obj);
    this.srcFile = obj;
    // this.addFile = true;

    this.displayWebViewer(this.blob);

    const addDocButton = document.getElementById('uploadFile');
    addDocButton.parentNode.removeChild(addDocButton);
  }

  displayWebViewer(blob: Blob){
    WebViewer({
      path: './../../../assets/lib',
      fullAPI:true
    }, this.viewerRef.nativeElement).then(async instance =>{

      instance.Core.PDFNet.initialize();

      instance.UI.loadDocument(blob, {filename: 'Preview Document'});
      instance.UI.disableElements(['ribbons']);
      instance.UI.setToolbarGroup('toolbarGroup-View',false);

      instance.Core.documentViewer.addEventListener('documentLoaded', async ()=>{
        const PDFNet = instance.Core.PDFNet;
        const doc = await PDFNet.PDFDoc.createFromBuffer(await this.file.arrayBuffer());

        let extractedText = "";

        const txt = await PDFNet.TextExtractor.create();
        ;
        const pageCount = await doc.getPageCount();
        for(let i=1; i<=pageCount; ++i){
          const page = await doc.getPage(i);
          const rect = await page.getCropBox();
          txt.begin(page, rect); // Read the page.
          extractedText += await txt.getAsText();
        }
        this.aiService.categorizeDocument(extractedText);
      });
    });
  }

  async submit() {
    console.log('here')
    console.log(this.templateForm)
    // await this.createWorkflow();
  }



  async createWorkflow() {
    console.log('Extracting form data ------------------------------');
    console.log('Name: ', this.templateForm.controls.workflowName.value);
    console.log(
      'Description: ',
      this.templateForm.controls.workflowDescription.value
    );
    console.log(this.templateForm);
    let template = null;
    if(this.templateForm.controls.templateName !== undefined){
      template = {templateName: this.templateForm.controls.templateName.value, templateDescription: this.templateForm.controls.templateDescription.value};
    }


    const phases = this.templateForm.controls.phases.value;
    const name = this.templateForm.controls.workflowName.value;
    const description = this.templateForm.controls.workflowDescription.value;
    await this.workflowService.createWorkflow(
      name,
      description,
      phases,
      this.originalFile,
      template,
      (response) => {
        if (response.status === 'success') {
          this.userService.displayPopOver('Success', 'You have successfully created a workflow');
          this.router.navigate(['/home']);
        } else {
          this.userService.displayPopOver('Error', 'Something has gone wrong, please try again');
        }
      }
    );
  }
}
