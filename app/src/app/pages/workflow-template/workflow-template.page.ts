import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
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
  tempDesc: templateDescription[]=[];

  constructor(
    private fb: FormBuilder,
    private plat: Platform,
    private workflowService: WorkFlowService,
    private templateService: WorkflowTemplateService,
    private userService: UserAPIService,
    private route: ActivatedRoute,
    private router: Router,
    private logger: Logger
  ) { }

  async ngOnInit() {
    if(this.plat.width() > 572){
      this.sizeMe = false;
    }else{
      this.sizeMe = true;
    }

    await this.getTemplateData();
    // await this.getTemplateids();


    this.templateForm = this.fb.group({
      templateName: ['', [Validators.required]],
      templateDescription: ['', [Validators.required]],
      templateFile: ['', [Validators.required]],
      phases: this.fb.array([]),
    });
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
    this.templateService.getWorkflowTemplateData(id, (response)=>{
      console.log(response);
      let template = response.template;
      let fileData = response.fileData;
      this.templateForm = this.fb.group({
        workflowName: [template.documentName,[Validators.required]],
        workflowDescription: [template.workflowDescription, [Validators.required]],
        phases: this.fb.array([]),
      });
      this.fillPhases(template.phases);
    })
  }

  fillPhases(phases: any){
    console.log(this.templateForm.controls.phases['controls'])
      for(let phase of phases){
        this.templateForm.controls.phases['controls'].push(this.fillPhase(phase[0]))
      }
      console.log(this.templateForm)
  }

  fillPhase(phase: phaseFormat){

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

}
