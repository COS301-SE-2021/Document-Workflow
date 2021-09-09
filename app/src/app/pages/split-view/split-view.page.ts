import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserAPIService } from 'src/app/Services/User/user-api.service';

@Component({
  selector: 'app-split-view',
  templateUrl: './split-view.page.html',
  styleUrls: ['./split-view.page.scss'],
})
export class SplitViewPage implements OnInit {

  constructor(
    private userServices: UserAPIService,
    private router: Router,
    ) { }

  ngOnInit() {
  }

  logout(){
    this.userServices.logout(()=>{
      this.router.navigate(['login']);
    });
    
  }
}
