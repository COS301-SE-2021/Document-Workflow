import { Component, OnInit, Input } from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import * as Cookies from 'js-cookie';

import { ActivatedRoute, Router } from '@angular/router';

import { User, UserAPIService } from '../../Services/User/user-api.service';
import { WorkFlowService } from 'src/app/Services/Workflow/work-flow.service';
import { WorkflowHistoryService } from 'src/app/Services/WorkflowHistory/workflow-history.service';
@Component({
  selector: 'app-workflow-history',
  templateUrl: './workflow-history.page.html',
  styleUrls: ['./workflow-history.page.scss'],
})
export class WorkflowHistoryPage implements OnInit {
  sizeMe: boolean;
  @Input('workflowId') workflowId: string;

  constructor(
    private modals: ModalController,
    private plat: Platform,
    private router: Router,
    private route: ActivatedRoute,
    private userApiService: UserAPIService,
    private workflowService: WorkFlowService,
    private workflowHistory: WorkflowHistoryService
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

    await this.getWorkflowHistory();
  }

  async getWorkflowHistory(){
    this.workflowHistory.getHistory(this.workflowId, (response)=>{
      console.log(response)
    })
  }
}
