import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  user;
  userEmail: string;

  constructor(
    private plat: Platform,private userApiService: UserAPIService,
    private route: Router,
    private router: ActivatedRoute
  ) { }

  async ngOnInit() {
    if(this.plat.width() > 572){
      this.sizeMe = false;
    }else{
      this.sizeMe = true;
    }
    if (Cookies.get('token') === undefined) {
      await this.route.navigate(['/login']);
      return;
    } else {
      this.userApiService.checkIfAuthorized().subscribe(
        (response) => {
          console.log('Successfully authorized user');
        },
        async (error) => {
          console.log(error);
          await this.route.navigate(['/login']);
          return;
        }
      );
    }

    await this.getContactInformation();
  }

  async getContactInformation(){
    await this.userApiService.getContacts(this.userEmail, (response)=>{
      console.log(response);
    })
  }

  async getUser() {
    await this.userApiService.getUserDetails(async (response) => {
      if (response) {
        this.user = response.data;
        this.userEmail = this.user.email;
      } else {

      }
    });
  }
}
