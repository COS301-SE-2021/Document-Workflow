/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/prefer-for-of */
import { Component, OnInit, Input } from '@angular/core';
import { LoadingController, ModalController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

//interface and services
import { User, UserAPIService } from './../../Services/User/user-api.service';
import {
  documentImage,
  DocumentAPIService,
} from './../../Services/Document/document-api.service';
import { AddWorkflowComponent } from 'src/app/components/add-workflow/add-workflow.component';
import { EditWorkflowComponent } from 'src/app/components/edit-workflow/edit-workflow.component';
import { WorkFlowService } from '../../Services/Workflow/work-flow.service';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.page.html',
  styleUrls: ['./workflow.page.scss'],
})
export class WorkflowPage implements OnInit {
  documents: documentImage[] = [];

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @Input() user: User;

  constructor(
    private docService: DocumentAPIService,
    private modals: ModalController,
    private plat: Platform,
    private router: Router,
    private userApiService: UserAPIService,
    private workFlowService: WorkFlowService,
    private loadctrl: LoadingController,
    private navControl: NavController
  ) {
  }

  ngOnInit() {

    console.log(localStorage.getItem('token'));
    this.userApiService.checkIfAuthorized().subscribe((response) => {
      console.log("Successfully authorized user");
    }, (error) => {
      console.log(error);
      this.router.navigate(['/login']);
    });
    this.loadWorkFlows();

  }

  async loadWorkFlows() {
    this.userApiService.getAllWorkOwnedFlows((response) => {
      console.log("Got owned workflows");
      console.log(response);
      if (response.status === 'success') {
        for (let i = 0; i < response.data.length; i++) {
          let tmpDoc: documentImage;
          tmpDoc = response.data[i];
          this.documents.push(tmpDoc);
        }
      } else {
        alert('workflow not found');
      }
    });
    this.userApiService.getAllWorkFlows((response) => {
      console.log("Got normal workflows");
      console.log(response);
      if (response.status === 'success') {
        for (let i = 0; i < response.data.length; i++) {
          let tmpDoc: documentImage;
          tmpDoc = response.data[i];
          this.documents.push(tmpDoc);
        }
      } else {
        alert('workflow not found');
      }
    });
    console.log(this.documents);
  }


  async addWorkflow() {
    const addModal = await this.modals.create({
      component: AddWorkflowComponent,
    });

    (await addModal).present();

    (await addModal).onDidDismiss().then(async (data) => {

      // const users = (await data).data['users'];
      const documents = (await data).data['document'];
      const file = (await data).data['file'];
      const users = documents.phases;

      const workflowData = {
        name: documents.workflowName,
        description: documents.workflowDescription
      };
      this.workFlowService.createWorkflow(workflowData, users, file, (response) => {
        if (response === 'success') {
          this.userApiService.displayPopOver('Congrats', 'Workflow has been created');
        } else {
          console.log(response);
          this.userApiService.displayPopOver('Unexpected failure', 'Workflow has not been created');
        }
      });
    });
  }

  viewWorkFlow(id: string, name: string) {
    // this.navControl.navigateForward
    this.router.navigate(['documentView', {
      id,
      documentname: name
    }]);
  }
}


