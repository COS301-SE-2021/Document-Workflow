import { Component, OnInit, ViewChild } from '@angular/core';
import { IonReorderGroup, ModalController } from '@ionic/angular';
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
import { AutoFillComponent } from 'src/app/components/auto-fill/auto-fill.component';
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
    private fb: FormBuilder,
    private modal : ModalController
  ) {}

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
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

    this.reOrder = true;

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

        },
        async (error) => {

          Cookies.set('token', '');
          await this.router.navigate(['/login']);
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

        //for the searching and sorting so we wont waste users data.
        this.sortPermission();
      } else {
        alert('Something went wrong');
      }
      this.workFlowService.dismissLoading();
    });
  }

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



  async deleteWorkFlow(id: string) {
    await this.userApiService.displayPopOverWithButtons(
      'Confirmation of deletion',
      'Are you sure you want to permanently delete this?',
      (response) => {

        if (response.data.confirm === true) {
          this.workFlowService.deleteWorkFlow(id, async (response2) => {
            if(response2.status === 'success'){
              await this.workFlowService.displayPopOver('Success', 'The workflow was successfully deleted');
              this.documents = [];
              await this.retrieveWorkflows();
            }

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

            if(response2.status === "success") {
              await this.userApiService.displayPopOver("Success", "The workflow has been successfully reverted by a phase");
              this.documents = [];
              await this.retrieveWorkflows();
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
      document.showWorkflow =false;
      for (let user of document.phases[document.currentPhase].users) {

        if (user.user === this.userEmail) {

          if (user.accepted === 'true') {

            document.showWorkflow = false;
          } else {
            document.showWorkflow = true;
          }
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

  showAll() {
    for (let document of this.documents) {
      document.showWorkflow = true;
    }
  }

  viewHistory(workflowID: string){
    this.leave=true;
    this.router.navigate([
      '/home/workflowHistory',
      {
        workflowId: workflowID,
      },
    ]);
  }

  verifier(workflowId:string){
    this.leave = true;
    this.router.navigate([
      '/home/documentVerify',
      {
        workflowId: workflowId,
      }
    ])
  }
}
