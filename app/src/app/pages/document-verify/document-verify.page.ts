import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { DocumentAPIService } from 'src/app/Services/Document/document-api.service';
import { UserAPIService } from 'src/app/Services/User/user-api.service';
import { WorkFlowService } from 'src/app/Services/Workflow/work-flow.service';
import * as Cookies from 'js-cookie';
@Component({
  selector: 'app-document-verify',
  templateUrl: './document-verify.page.html',
  styleUrls: ['./document-verify.page.scss'],
})
export class DocumentVerifyPage implements OnInit {
  @Input('workflowID') docName: string;

  sizeMe: boolean;
  constructor(
    private route: ActivatedRoute,
    private docApi: DocumentAPIService,
    private workflowService: WorkFlowService,
    private router: Router,
    private userApiService: UserAPIService,
    private plat: Platform
  ) {}

  async ngOnInit() {
    if (this.plat.width() > 572) {
      this.sizeMe = false;
    } else {
      this.sizeMe = true;
    }

    if (Cookies.get('token') === undefined) {
      await this.router.navigate(['/login']);
      this.workflowService.dismissLoading();
      return;
    } else {
      this.userApiService.checkIfAuthorized().subscribe(
        (response) => {
          console.log('Successfully authorized user');
        },
        async (error) => {
          console.log(error);
          await this.router.navigate(['/login']);
          this.workflowService.dismissLoading();
          return;
        }
      );
    }
  }
}
