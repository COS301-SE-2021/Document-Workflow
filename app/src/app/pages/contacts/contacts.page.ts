import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import * as Cookies from 'js-cookie';
import { UserAPIService } from 'src/app/Services/User/user-api.service';

export interface contact{
  email: string;
}
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
    private plat: Platform,private userApiService: UserAPIService,
    private router: Router,
  ) { }

  async ngOnInit() {
    if(this.plat.width() > 572){
      this.sizeMe = false;
    }else{
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
