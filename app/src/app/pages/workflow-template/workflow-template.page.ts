import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Platform } from '@ionic/angular';
import { WorkFlowService } from 'src/app/Services/Workflow/work-flow.service';
import { WorkflowTemplateService } from 'src/app/Services/WorkflowTemplate/workflow-template.service';

@Component({
  selector: 'app-workflow-template',
  templateUrl: './workflow-template.page.html',
  styleUrls: ['./workflow-template.page.scss'],
})
export class WorkflowTemplatePage implements OnInit {

  sizeMe: boolean;
  templateForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private plat: Platform,
    private workflowService: WorkFlowService,
    private templateService: WorkflowTemplateService
  ) { }

  ngOnInit() {
    if(this.plat.width() > 572){
      this.sizeMe = false;
    }else{
      this.sizeMe = true;
    }

    this.templateForm = this.fb.group({
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
    this.getWorkflowTemplateData();
  }

  getWorkflowTemplateData(){

  }

}
