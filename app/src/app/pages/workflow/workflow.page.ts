import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

//interface and services
import { User } from  './../../Services/User/user-api.service';
import { documentImage, DocumentAPIService } from './../../Services/Document/document-api.service';
import { AddWorkflowComponent } from 'src/app/components/add-workflow/add-workflow.component';
import { EditWorkflowComponent } from 'src/app/components/edit-workflow/edit-workflow.component';




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
    private router: Router
  ) {}



  async ngOnInit() {}

  loadDocuments() {
    this.docService.getDocuments().subscribe();
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
        let user = (await data).data['users'];
        let docummentsss = (await data).data['document'];
        let file = (await data).data['file'];

        console.log(user);
    });
    return;
  }

  viewWorkFlow(){
    this.router.navigate(['documentView']);
  }
}
