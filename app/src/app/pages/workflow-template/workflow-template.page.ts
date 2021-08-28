import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { DocumentActionAreaComponent } from 'src/app/components/document-action-area/document-action-area.component';
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
  sizeMe: boolean;
  templateForm: FormGroup;
  readyForPhase2: boolean = false;
  phase2: boolean = true;
  tempDesc: templateDescription[]=[];
  phaseViewers: boolean[]=[];
  originalFile:string ;
  ownerEmail:string;

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
  ) { }

  async ngOnInit() {
    if(this.plat.width() > 572){
      this.sizeMe = false;
    }else{
      this.sizeMe = true;
    }

    //todo uncomment the comment
    // await this.getTemplateData();
    await this.useThisTemplate('612942988ed7c10970592172');

    // this.templateForm = this.fb.group({
    //   templateName: ['', [Validators.required]],
    //   templateDescription: ['', [Validators.required]],
    //   templateFile: ['', [Validators.required]],
    //   phases: this.fb.array([]),
    // });
    // await this.getWorkflowTemplateData();
  }

  async getTemplateData(){
    console.log("Fetching template ids");
    this.userService.getTemplateIDs(async (response)=>{
      console.log(response);
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
    console.log(id);
    this.templateService.getWorkflowTemplateData(id, (response)=>{
      console.log(response);
      let template = response.template;
      this.originalFile = response.fileData;
      this.templateForm = this.fb.group({
        workflowName: [template.documentName,[Validators.required]],
        workflowDescription: [template.workflowDescription, [Validators.required]],
        phases: this.fb.array([]),
      });
      this.fillPhases(template.phases);
      this.readyForPhase2 = true;
    })
  }

  fillPhases(phases: any){
    console.log(this.templateForm.controls.phases['controls'])
      for(let phase of phases){
        this.templateForm.controls.phases['controls'].push(this.fillPhase(phase[0]))
      }
      console.log(this.templateForm)
  }

  viewPhase(i: number){
    console.log(this.phaseViewers)
    console.log(i)
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

    console.log(temp.controls.users['controls'])
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
      phaseStatus: new FormControl('Create'),
      showPhases: new FormControl(true),
      phaseNumber: new FormControl(i),
      _id: new FormControl(''),
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
    const a = await this.modal.create({
      component: DocumentActionAreaComponent,
      componentProps: {
        file: this.originalFile,
        ownerEmail: this.ownerEmail,
        phaseNumber: i,
      },
    });
  }

  submit(){

  }
}
