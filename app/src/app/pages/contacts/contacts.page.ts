import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import * as Cookies from 'js-cookie';
import { UserAPIService } from 'src/app/Services/User/user-api.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage implements OnInit {

  sizeMe: boolean;

  constructor(
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

}
