import { Component, OnInit, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import {User} from './../user';
import { UserService } from '../user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-workflow',
  templateUrl: './view-workflow.component.html',
  styleUrls: ['./view-workflow.component.scss'],
})
export class ViewWorkflowComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
