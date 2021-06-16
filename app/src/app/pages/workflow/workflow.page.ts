import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

//interface and services
import { User, UserAPIService } from  './../../Services/User/user-api.service';
import { documentImage, DocumentAPIService } from './../../Services/Document/document-api.service';
import { AddWorkflowComponent } from 'src/app/components/add-workflow/add-workflow.component';
import { EditWorkflowComponent } from 'src/app/components/edit-workflow/edit-workflow.component';
import {WorkFlowService} from "../../Services/Workflow/work-flow.service";

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.page.html',
  styleUrls: ['./workflow.page.scss'],
})
export class WorkflowPage implements OnInit {
  documents: documentImage[]=[];
  // eslint-disable-next-line @typescript-eslint/member-ordering
  @Input()user: User;
  constructor(
    private docService: DocumentAPIService,
    private modals: ModalController,
    private plat: Platform,
    private router: Router,
    private userApiService: UserAPIService
  ) {}



  ngOnInit() {
    //TODO: Have a nice loader
    this.loadWorkFlows();
  }

  async loadWorkFlows() {
    alert('REMEMBER TO ADD FUNCTIONALITY OF GETTING CURRENTLY LOGGED IN USER!!!');
    const email = 'timothyhill202@gmail.com';

    this.userApiService.getAllWorkOwnedFlows(email, (response) =>{
        console.log('inside of callback and having data');
        console.log(response);
    });
    this.userApiService.getAllWorkFlows(email, (response)=>{
      console.log('Thats right friends, we are going to use callbacks');
      console.log(response);
    });
  }

  async editDoc(id: number) {
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
        let users = (await data).data['users'];
        let documents = (await data).data['document'];
        let file = (await data).data['file'];

        let workflowData = {
          owner_email: 'timothyhill202@gmail.com', //TODO: swap out this email address using the JWT/stored email address after login
          name: documents.workflowName
        };
        console.log(workflowData);
        console.log(file);
        console.log(users);
        let response = await WorkFlowService.createWorkflow(workflowData, users, file);
        if(response === 'success')
          alert('Workflow successfully created');
        else {
            console.log(response);
            alert(response);
        };
    });
    return;
  }

  viewWorkFlow(){
    this.router.navigate(['documentView']);
  }
}
