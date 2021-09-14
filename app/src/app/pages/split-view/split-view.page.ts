import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserAPIService } from 'src/app/Services/User/user-api.service';

@Component({
  selector: 'app-split-view',
  templateUrl: './split-view.page.html',
  styleUrls: ['./split-view.page.scss'],
})
export class SplitViewPage implements OnInit {
  user;
  userEmail;
  constructor(
    private userServices: UserAPIService,
    private router: Router,
    ) { }

  ngOnInit() {
  }

  //Get user data
  async getUserData(): Promise<void>
  {
    await this.userServices.getUserDetails(async (response) => {
      if (response) {
        this.user = response.data;
        this.userEmail = this.user.email;
        const container = document.getElementById('profileDetails');
        const div = document.createElement('div');
        div.innerHTML = this.user.email;
        container.appendChild(div);
        console.log(this.userEmail);
      } else {
        this.userServices.displayPopOver('Error', 'Failed to get users');
      }
    });

  }

  logout(){
    this.userServices.logout(()=>{
      this.router.navigate(['login']);
    });
  }
}
