import { TemplateBindingIdentifier } from '@angular/compiler';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Logger } from 'src/app/Services/Logger';
import { UserAPIService } from 'src/app/Services/User/user-api.service';
import { WorkFlowService } from 'src/app/Services/Workflow/work-flow.service';
import { WorkflowTemplateService } from 'src/app/Services/WorkflowTemplate/workflow-template.service';


export interface templateDescription{
  templateID: string;
  templateName: string;
  templateDescription: string;
}
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
      console.log(this.tempDesc)
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

}
