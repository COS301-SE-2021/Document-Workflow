import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Logger } from 'src/app/Services/Logger';
import {
  workflowFormat,
  WorkFlowService,
} from 'src/app/Services/Workflow/work-flow.service';
import { WorkflowTemplateService } from 'src/app/Services/WorkflowTemplate/workflow-template.service';

@Component({
  selector: 'app-workflow-template',
  templateUrl: './workflow-template.page.html',
  styleUrls: ['./workflow-template.page.scss'],
})
export class WorkflowTemplatePage implements OnInit {
  @Input('workflowId') workflowId: string;

  sizeMe: boolean;
  templateForm: FormGroup;
  ready: boolean = false;

  constructor(
    private fb: FormBuilder,
    private plat: Platform,
    private workflowService: WorkFlowService,
    private templateService: WorkflowTemplateService,
    private router: Router,
    private route: ActivatedRoute,
    private logger: Logger
  ) {}

  async ngOnInit() {
    await this.route.params.subscribe((data) => {
      this.workflowId = data['workflowId'];
    });

    if (this.plat.width() > 572) {
      this.sizeMe = false;
    } else {
      this.sizeMe = true;
    }

    let data = await this.getWorkflowTemplateData();

    this.templateForm = this.fb.group({
      templateName: [data.name, [Validators.required]],
      templateDescription: [data.description, [Validators.required]],
      templateFile: ['', [Validators.required]],
      phases: this.fb.array([]),
    });

    await this.fillPhases(data);

    this.ready = true;
  }



  async getWorkflowTemplateData(): Promise<workflowFormat> {
    await this.templateService.getWorkflowTemplateNameAndDescription(
      '',
      async (response) => {
        this.logger.Brent(response);
      }
    );
    return null;
  }

  async fillPhases(data: workflowFormat){
    this.logger.Brent(data);
  }
}
