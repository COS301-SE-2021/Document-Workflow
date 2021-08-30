/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit, Input } from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import * as Cookies from 'js-cookie';

import { ActivatedRoute, Router } from '@angular/router';



// for the module pages


//imports for services and interfaces
import { User, UserAPIService } from '../../Services/User/user-api.service';
import { WorkFlowService } from 'src/app/Services/Workflow/work-flow.service';


@Component({
  selector: 'app-document-archive',
  templateUrl: './document-archive.page.html',
  styleUrls: ['./document-archive.page.scss'],
})
export class DocumentArchivePage implements OnInit {
  sizeMe: boolean;

  constructor(
    private modals: ModalController,
    private plat: Platform,
    private router: Router,
    private userApiService: UserAPIService,
    private workflowService: WorkFlowService
  ) {}

  @Input() user: User;

  async ngOnInit() {
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
          console.log('Successfully authorized user');
        },
        async (error) => {
          console.log(error);
          await this.router.navigate(['/login']);
          return;
        }
      );
    }
  }
}
