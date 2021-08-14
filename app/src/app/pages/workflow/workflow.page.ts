import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { IonReorderGroup, LoadingController, ModalController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

//interface and services
import { User, UserAPIService } from './../../Services/User/user-api.service';
import {
  documentImage,
  DocumentAPIService,
} from './../../Services/Document/document-api.service';
import { phaseFormat, workflowFormat, WorkFlowService } from '../../Services/Workflow/work-flow.service';
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
  userEmail: string;
  user;
  reOrder: boolean;
  isBrowser: boolean;
  sizeMe: boolean;
  allUserDocuments: workflowFormat[] =[];
  ownedWorkflows = [];
  workflows = [];

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

  debug(str: any){
    console.log(str);
  }

  async ngOnInit() {
    this.reOrder = true;

    if(this.plat.width() > 572){
      this.sizeMe = false;
    }else{
      this.sizeMe = true;
    }

    const load = await this.loadctrl.create({
      message: 'Hang in there... we are almost done',
      duration: 5000,
      showBackdrop: false,
      spinner: 'bubbles'
    });
    await load.present();

    if(Cookies.get('token') === undefined){
      await this.router.navigate(['/login']);
      await load.dismiss();
      return;
    }
    else
    {
      this.userApiService.checkIfAuthorized().subscribe((response) => {
        console.log('Successfully authorized user');
      }, async (error) => {
        console.log(error);
        await this.router.navigate(['/login']);
        await load.dismiss();
        return;
      });
    }
    await this.getUser();
    await load.dismiss();
  }

  async getUser(){
     await this.userApiService.getUserDetails(async (response) => {
       console.log(response);
       if (response) {
         this.user = response.data;
         console.log("Our user looks like: ");
         console.log(this.user);
         this.userEmail = this.user.email;
         console.log("Finished fetching the user");
         await this.retrieveWorkflows();
       } else {
         await this.userApiService.displayPopOver('Error', 'Cannot find user');
         Cookies.set('token', '');
         await this.router.navigate(['login']);
       }
     });
  }

  async retrieveWorkflows(){
    await this.workFlowService.getUserWorkflowsData(response =>{
      // console.log(response);
      if(response.status === 'success'){
        const ownedWorkflows = response.data.ownedWorkflows;
        const workflows = response.data.workflows;

        for(let tmpDoc of ownedWorkflows){
          if(tmpDoc != null) {
            this.documents.push(tmpDoc);
          }
        }

        for(let tmpDoc of workflows){
          if(tmpDoc != null){
            this.documents.push(tmpDoc);
          }
        }
        //for the searching and sorting so we wont waste users data.
        this.allUserDocuments = this.documents;
        console.log(this.documents);
      }
      else{
        alert('Something went wrong');
      }
    })

  }
//todo move this to the spec.ts of workflow
  async testRetrieveWorkflow(){
    console.log("Testing the retrieve workflow function");
    const id = "61163482d68c450938c29a30";
    await this.workFlowService.getWorkFlowData(id, response=>{
      console.log(response);
    });
    await this.workFlowService.getUserWorkflowsData(response =>{
      console.log(response);
    });
  }

  async testUpdatePhase(){
    const id = '611661feb394bb1d4cc91f3e';
    const accepts = true;
    await this.workFlowService.updatePhase(id, accepts, null, data=>{
      console.log(data);
    });
  }

  async deleteWorkFlow(id: string){
    const deleteMod = this.modals.create({
      component: ConfirmDeleteWorkflowComponent
    });

    (await deleteMod).present();
    (await deleteMod).onDidDismiss().then(async (data) => {
      const result = (await data).data.confirm;
      if (result){
        this.workFlowService.deleteWorkFlow(id, (response) =>{
          console.log(response);
          this.userApiService.displayPopOver('Deletion of workflow', 'Workflow has been successfully deleted');
        });

      }else{
        //not delete
      }
    });
  }

  async editWorkflow(id_: string){
    // const editModal = await this.modals.create({
    //   component: EditWorkflowComponent,
    //   componentProps:{
    //     workflowID: id_
    //   }
    // });

    // (await editModal).present();

    // (await editModal).onDidDismiss().then(async (data)=>{
    //   const documents = (await data).data['document'];
    //   // const file = (await data).data['file'];
    //   let phases = '';
    //   console.log(documents.phases);
    //   for(let i=0; i<documents.phases.length; ++i)
    //Sending arrays of arrays does not work well in angular so this workaround will have to do.
    //   {
    //     let temp = '[';
    //     for(const [key, value] of Object.entries(documents.phases[i]))
    //       temp+=value + ' ';
    //     phases += temp.substr(0, temp.length-1) +']'; //dont want the trailing space
    //   }
    //   console.log(phases);
    //   const workflowData = {
    //     name: documents.workflowName,
    //     description: documents.workflowDescription
    //   };
    // })
  }

  async addWorkflow() {
    this.router.navigate(['home/addWorkflow']);
  }

  viewWorkFlow( id: string, name: string) {
    console.log(id)
    // this.navControl.navigateForward
    this.router.navigate(['/home/documentView', {
      workflowId: id,
      documentname: name,
      userEmail: this.user.email
    }]);
  }

  editDocument(id: string){
    this.router.navigate(['/home/documentEdit', {
      workflowId: id,
      userEmail: this.user.email
    }]);
  }

  fixOrder(event: CustomEvent<ItemReorderEventDetail>){
    event.detail.complete();
  }

  showOnlyWorkflowOwned(){
    this.documents = [];
    console.log(this.documents);
    for(const document of this.allUserDocuments){
      if(document.ownerEmail === this.userEmail){
        this.documents.push(document);
      }
    }
    console.log(this.documents);
  }

  sortByNeededActions(){
    this.documents = [];
    // this.allUserDocuments.push(this.docService.createTestDocuments());
    for(let document of this.allUserDocuments){
      for(let phase of document.phases){
        if(phase.status !== 'Completed'){
          for(let user of phase.users){
            if(user.email === this.userEmail){
              this.documents.push(document);
            }
          }
        }
      }
    }
  }

  getByName(name:string){
    this.documents=[];
    for(let document of this.allUserDocuments){
      if(document.name === name){
        this.documents.push(document);
      }
    }
  }

  showPhase(phase: phaseFormat){

    phase.showPhase = !phase.showPhase;
  }
}


