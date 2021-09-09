import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import {User, UserAPIService} from '../../Services/User/user-api.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage implements OnInit {

  sizeMe: boolean;

  constructor(
    private plat: Platform,
    private userApiService: UserAPIService  )
  { }

  ngOnInit() {
    if(this.plat.width() > 572){
      this.sizeMe = false;
    }else{
      this.sizeMe = true;
    }
  }

  // delete contact from contacList <backend>
  async deleteContact(cont): Promise<void>
  {

    //ToDo backend function >>> call submitContact:
    await this.userApiService.displayPopOverWithButtons(
      'Confirmation of deletion',
      'Removing contact from contact list',
      (response) => {
        console.log(response);
        if (response.data.confirm === true) {
          this.userApiService.displayLoading();
          this.userApiService.deleteContact(cont, (resp) => {

            console.log(resp);
            this.userApiService.dismissLoading();
          });
        }
      }
    );
  }

}
