import { Component, OnInit, ViewChild } from '@angular/core';
import { IonReorderGroup } from '@ionic/angular';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

//interface and services
import { User, UserAPIService } from './../../Services/User/user-api.service';
import {
  phaseFormat,
  workflowFormat,
  WorkFlowService,
} from '../../Services/Workflow/work-flow.service';
import { ItemReorderEventDetail } from '@ionic/core';
import * as Cookies from 'js-cookie';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.page.html',
  styleUrls: ['./workflow.page.scss'],
})
export class WorkflowPage implements OnInit {
  sortForm: FormGroup;
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
  leave: boolean = false;

  constructor(
    private plat: Platform,
    private router: Router,
    private userApiService: UserAPIService,
    private workFlowService: WorkFlowService,
    private fb: FormBuilder
  ) {}

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    console.log("hfijbnrfijbfrijbwfijb")
  }

  ionViewDidEnter(){
    if(this.leave === true){
      this.documents =[];
      this.ngOnInit();
      this.leave = false;
    }
  }

  async ngOnInit() {
    this.sortForm = this.fb.group({
      sortBy: [''],
    });
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
      if (response) {
        this.user = response.data;
        this.userEmail = this.user.email;
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
        console.log(this.documents);
        //for the searching and sorting so we wont waste users data.
        this.sortPermission();
      } else {
        alert('Something went wrong');
      }
      this.workFlowService.dismissLoading();
    });
  }

  //TODO: clean up this function, the logic behind it isn't entirely clear
  sortPermission() {
    let i: number = 0;
    for (const document of this.documents) {
      this.documentPermission[i] = 0;
      if (document.status !== 'Completed') {
        if (document.phases[document.currentPhase].status !== 'Completed') {
          if (document.ownerEmail === this.userEmail)
            this.documentPermission[i] = 2;
          for (let user of document.phases[document.currentPhase].users) {
            if (user.user === this.userEmail) {
              if (user.accepted === 'false') {
                //TODO: swap to boolean once changes in backend made
                if (user.permission === 'view') {
                  this.documentPermission[i] = 2;
                } else {
                  this.documentPermission[i] = 1;
                }
              }
            }
          }
        }
      } else {
        this.documentPermission[i] = 2;
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
          this.workFlowService.displayLoading();
          this.workFlowService.deleteWorkFlow(id, (response2) => {

            console.log(response2);
            this.workFlowService.dismissLoading();
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
          this.workFlowService.revertPhase(id, async (response2) => {
            console.log(response2);
            if(response2.status === "success") {
              await this.userApiService.displayPopOver("Success", "The workflow has been successfully reverted by a phase");
            }
          });
        }
      }
    );
  }

  async editWorkflow(id: string) {
    this.leave=true;
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

  viewWorkFlow(id: string, name: string, status) {
    // this.navControl.navigateForward
    this.leave=true;
    this.router.navigate([
      '/home/documentView',
      {
        workflowId: id,
        documentname: name,
        userEmail: this.user.email,
        status: status,
      },
    ]);
  }

  editDocument(id: string, name: string) {
    this.leave=true;
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

  sortBy() {
    console.log(typeof this.sortForm.controls.sortBy.value);
    switch (parseInt(this.sortForm.controls.sortBy.value)) {
      case 1:
        this.showOnlyWorkflowOwned();
        break;
      case 2:
        this.sortByNeededActions();
        break;
      case 3:
        this.showAll();
        break;
      case 4:
        this.reOrderWorkflows();
        break;
      case 5:
        this.showNonOwnedWorkflows();
        break;
    }
  }

  showNonOwnedWorkflows() {
    for (const document of this.documents) {
      if (document.ownerEmail !== this.userEmail) {
        document.showWorkflow = true;
      } else {
        document.showWorkflow = false;
      }
    }
  }

  reOrderWorkflows() {
    this.reOrder = !this.reOrder;
  }

  showOnlyWorkflowOwned() {
    console.log('here');
    for (const document of this.documents) {
      if (document.ownerEmail === this.userEmail) {
        document.showWorkflow = true;
      } else {
        document.showWorkflow = false;
      }
    }
  }

  sortByNeededActions() {
    for (let document of this.documents) {
      for (let user of document.phases[document.currentPhase].users) {
        if (user.user === this.userEmail) {
          if (user.accepted === 'true') {
            document.showWorkflow = false;
          } else {
            document.showWorkflow = true;
          }
        } else {
          document.showWorkflow = false;
        }
      }
    }
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
    const id = '61191eb89da4034090bb3d4f';
    await this.workFlowService.retrieveDocument(id, (response) => {
      console.log(response);
    });
  }

  debug(num: number) {
    this.getWorkflow();
  }

  showAll() {
    for (let document of this.documents) {
      document.showWorkflow = true;
    }
  }
}
