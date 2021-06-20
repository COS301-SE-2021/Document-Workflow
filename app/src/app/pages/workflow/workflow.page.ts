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
  public title = 'Home Page';
  documents: documentImage[] = [];

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @Input() user: User;
  constructor(
    private docService: DocumentAPIService,
    private modals: ModalController,
    private plat: Platform,
    private router: Router,
    private userApiService: UserAPIService,
    private loadctrl: LoadingController,
    private navControl: NavController
  ) {}

  ngOnInit() {

    //TODO: Have a nice loader
    this.loadWorkFlows();
  }

  changeTitle(title) {
    this.title = title;
  }

  async loadWorkFlows() {
    alert(
      'REMEMBER TO ADD FUNCTIONALITY OF GETTING CURRENTLY LOGGED IN USER!!!'
    );
    const email = 'johnaldweasely2@gmail.com';

    this.userApiService.getAllWorkOwnedFlows(email, (response) => {
      console.log('Got owned workflows');
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
    this.userApiService.getAllWorkFlows(email, (response) => {
      console.log('Got normal workflows');
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

  async editDoc(id: string) {
    const editModal = await this.modals.create({
      component: EditWorkflowComponent,
      componentProps: {
        docID: id,
      },
    });
    (await editModal).onDidDismiss().then(() => {});

    return (await editModal).present();
  }

  async addWorkflow() {
    const addModal = await this.modals.create({
      component: AddWorkflowComponent,
    });

    (await addModal).present();

    (await addModal).onDidDismiss().then(async (data) => {

        const users = (await data).data.users;
        const documents = (await data).data.document;
        const file = (await data).data.file;
        const email = 'johnaldweasely2@gmail.com';
        const workflowData = {
          owner_email: email, //TODO: swap out this email address using the JWT/stored email address after login
          name: documents.workflowName,
          description: documents.workflowDescription
        };
        console.log(workflowData);
        console.log(file);
        console.log(users);
        const response = await WorkFlowService.createWorkflow(workflowData, users, file);
        if(response === 'success'){
          alert('Workflow successfully created');
        }else {
            console.log(response);
            alert(response);
        };
    });
    return;
  }

  viewWorkFlow(id: string, name: string) {
    // this.navControl.navigateForward
    this.router.navigate(['documentView', {
      id,
      documentname: name
    }]);
  }


}
