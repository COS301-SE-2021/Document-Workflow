import { Component, OnInit, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import {ModalController} from '@ionic/angular';
// import {ModalPage}

import { ActivatedRoute } from '@angular/router';

import { User } from './../user';
import { Document } from '../document';
import { UserService } from '../user.service';
import { DocumentService } from '../document.service';

@Component({
  selector: 'app-view-workflow',
  templateUrl: './view-workflow.component.html',
  styleUrls: ['./view-workflow.component.scss'],
})
export class ViewWorkflowComponent implements OnInit {
  constructor(
    private storageService: UserService,
    private docStorage: DocumentService
  ) {}

  @Input() user:User;

  documents: Document[] = [];
  async ngOnInit() {
    this.user = await  this.storageService.getUser(1);
    this.documents = await this.docStorage.getDocuments(this.user.id);
    console.log(this.documents);
  }
}
