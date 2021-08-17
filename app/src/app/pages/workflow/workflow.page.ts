import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {
  IonReorderGroup,
  LoadingController,
  ModalController,
  NavController,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

//interface and services
import { User, UserAPIService } from './../../Services/User/user-api.service';
import {
  documentImage,
  DocumentAPIService,
} from './../../Services/Document/document-api.service';
import {
  phaseFormat,
  workflowFormat,
  WorkFlowService,
} from '../../Services/Workflow/work-flow.service';
import { ConfirmDeleteWorkflowComponent } from 'src/app/components/confirm-delete-workflow/confirm-delete-workflow.component';
import { ItemReorderEventDetail } from '@ionic/core';
import * as Cookies from 'js-cookie';
@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.page.html',
  styleUrls: ['./workflow.page.scss'],
})
export class WorkflowPage implements OnInit {
  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;
  documents: workflowFormat[] = [];
  documentPermission: number[] = [];
  userEmail: string;
  user;
  reOrder: boolean;
  isBrowser: boolean;
  sizeMe: boolean;
  ownedWorkflows = [];
  workflows = [];

  constructor(
    private modals: ModalController,
    private plat: Platform,
    private router: Router,
    private userApiService: UserAPIService,
    private workFlowService: WorkFlowService,
    private loadctrl: LoadingController
  ) {}

  async ngOnInit() {
    this.workFlowService.displayLoading();
    this.reOrder = true;

    if (this.plat.width() > 572) {
      this.sizeMe = false;
    } else {
      this.sizeMe = true;
    }



    if (Cookies.get('token') === undefined) {
      await this.router.navigate(['/login']);
      this.workFlowService.dismissLoading();
      return;
    } else {
      this.userApiService.checkIfAuthorized().subscribe(
        (response) => {
          console.log('Successfully authorized user');
        },
        async (error) => {
          console.log(error);
          await this.router.navigate(['/login']);
          this.workFlowService.dismissLoading();
          return;
        }
      );
    }
    await this.getUser();

  }

  async getUser() {
    await this.userApiService.getUserDetails(async (response) => {
      console.log(response);
      if (response) {
        this.user = response.data;
        console.log('Our user looks like: ');
        console.log(this.user);
        this.userEmail = this.user.email;
        console.log('Finished fetching the user');
        await this.retrieveWorkflows();
      } else {
        await this.userApiService.displayPopOver('Error', 'Cannot find user');
        Cookies.set('token', '');
        await this.router.navigate(['login']);
      }
    });
  }

  async retrieveWorkflows() {
    await this.workFlowService.getUserWorkflowsData((response) => {
      if (response.status === 'success') {
        const ownedWorkflows = response.data.ownedWorkflows;
        const workflows = response.data.workflows;

        for (let tmpDoc of ownedWorkflows) {
          if (tmpDoc != null) {
            this.documents.push(tmpDoc);
          }
        }

        for (let tmpDoc of workflows) {
          if (tmpDoc != null) {
            this.documents.push(tmpDoc);
          }
        }
        //for the searching and sorting so we wont waste users data.
        console.log(this.documents);
        this.sortPermission();
      } else {
        alert('Something went wrong');
      }
      this.workFlowService.dismissLoading();
    });
  }

  //TODO: clean up this function, the logic behind it isn't entirely clear
  sortPermission() {
    let i: number =0;
    for (const document of this.documents) {
      this.documentPermission[i] =0;
      if (document.phases[document.currentPhase].status !== 'Completed') {
        for (let user of document.phases[document.currentPhase].users) {
          if (user.email === this.userEmail) {
            if(user.permission === "view"){
              this.documentPermission[i] = 2;
            }else{
              this.documentPermission[i] = 1;
            }
          }
        }
      }
      i++;
    }
  }

  //todo move this to the spec.ts of workflow
  async testRetrieveWorkflow() {
    console.log('Testing the retrieve workflow function');
    const id = '61163482d68c450938c29a30';
    await this.workFlowService.getWorkFlowData(id, (response) => {
      console.log(response);
    });
    await this.workFlowService.getUserWorkflowsData((response) => {
      console.log(response);
    });
  }

  async testUpdatePhase() {
    const id = '611661feb394bb1d4cc91f3e';
    const accepts = true;
    await this.workFlowService.updatePhase(id, accepts, null, (data) => {
      console.log(data);
    });
  }

  async deleteWorkFlow(id: string) {
    await this.userApiService.displayPopOverWithButtons(
      'Confirmation of deletion',
      'Are you sure you want to permanently delete this?',
      (response) => {
        console.log(response);
        if (response.data.confirm === true) {
          this.workFlowService.deleteWorkFlow(id, (response2) => {
            console.log(response2);
          });
        }
      }
    );
  }

  revertPhase(id: string) {
    this.userApiService.displayPopOverWithButtons(
      'Revert the phase',
      'Are you sure you want to revert the phase?',
      (response) => {
        if (response.data.confirm === true) {
          this.workFlowService.revertPhase(id, (response2) => {
            console.log(response2);
          });
        }
      }
    );
  }

  async editWorkflow(id: string) {
    this.router.navigate([
      'home/workflowEdit',
      {
        workflowId: id,
      },
    ]);
  }

  async addWorkflow() {
    this.router.navigate(['home/addWorkflow']);
  }

  viewWorkFlow(id: string, name: string) {
    // this.navControl.navigateForward
    this.router.navigate([
      '/home/documentView',
      {
        workflowId: id,
        documentname: name,
        userEmail: this.user.email,
      },
    ]);
  }

  editDocument(id: string, name: string) {
    this.router.navigate([
      '/home/documentEdit',
      {
        workflowId: id,
        documentname: name,
        userEmail: this.user.email,
      },
    ]);
  }

  fixOrder(event: CustomEvent<ItemReorderEventDetail>) {
    event.detail.complete();
  }

  showOnlyWorkflowOwned() {
    for (const document of this.documents) {
      if (document.ownerEmail === this.userEmail) {
        document.showWorkflow = true;
      } else {
        document.showWorkflow = false;
      }
    }
    console.log(this.documents);
  }

  sortByNeededActions() {
    for (let document of this.documents) {
      for (let user of document.phases[document.currentPhase].users) {
        if (user.email === this.userEmail) {
          if (user.accepted === true) {
            document.showWorkflow = false;
          } else {
            document.showWorkflow = true;
          }
        } else {
          document.showWorkflow = false;
        }
      }
    }
    console.log(this.documents);
  }

  getByName(name: string) {
    for (let document of this.documents) {
      if (document.name === name) {
        document.showWorkflow = true;
      } else {
        document.showWorkflow = false;
      }
    }
  }

  showPhase(phase: phaseFormat) {
    phase.showPhase = !phase.showPhase;
  }

  async getWorkflow() {
    const id = '611661feb394bb1d4cc91f3e';
    await this.workFlowService.retrieveDocument(id, (response) => {
      console.log(response);
    });
  }

 debug(num: number) {
    if(num === 1){
      this.workFlowService.displayLoading();
    }else{
      this.workFlowService.dismissLoading();
    }
  }
  showAll() {
    for (let document of this.documents) {
      document.showWorkflow = true;
    }
  }
}
