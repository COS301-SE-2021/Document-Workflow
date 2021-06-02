import { Component, OnInit, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

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

  ngOnInit() {
    //get document data and display it
  }
}
