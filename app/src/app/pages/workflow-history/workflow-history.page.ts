import { Component, OnInit, Input } from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import * as Cookies from 'js-cookie';

import { ActivatedRoute, Router } from '@angular/router';

import { User, UserAPIService } from '../../Services/User/user-api.service';
import { WorkFlowService } from 'src/app/Services/Workflow/work-flow.service';
import { WorkflowHistoryService } from 'src/app/Services/WorkflowHistory/workflow-history.service';

export interface History {
  currentPhase: number;
  date: Date;
  hash: string;
  type: string;
  userEmail: String;
}
@Component({
  selector: 'app-workflow-history',
  templateUrl: './workflow-history.page.html',
  styleUrls: ['./workflow-history.page.scss'],
})
export class WorkflowHistoryPage implements OnInit {
  sizeMe: boolean;
  histories: History[] = [];
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

  async getWorkflowHistory() {
    this.workflowHistory.getHistory(this.workflowId, (response) => {
      console.log(response);
      if (response.status === 'success') {
        for (let entry of response.data.history.entries) {
          let tmp: History = JSON.parse(entry);
          tmp.type = this.textConverter(tmp.type);
          tmp.currentPhase += 1;
          this.histories.push(tmp);
        }
        console.log(this.histories);
      } else {
        this.userApiService.displayPopOver(
          'Error: GetHistory',
          'Please try again'
        );
      }
    });
  }

  textConverter(str: string): string {
    let tmp: string;
    switch (str) {
      case 'Create':
        tmp = 'created the workflow';
        break;
      case 'Sign':
        tmp = 'signed the workflow';
        break;
      case 'View':
        tmp = 'viewed';
        break;
      case 'Accept':
        tmp = 'accepted the phase';
        break;
      case 'Revert':
        tmp = 'reverted the changes made';
        break;
    }
    return tmp;
  }
}
