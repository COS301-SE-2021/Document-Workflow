import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { UserAPIService } from 'src/app/Services/User/user-api.service';
@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
})
export class IntroPage implements OnInit {


  constructor(private router: Router, private userAPiService: UserAPIService) { }

  ngOnInit() {
  }
  getStarted()
  {
    this.router.navigate(['login']);
  }
  // var dateToday = new Date();
  // page.currentYear = dateToday.getFullYear();
  async displaypopOver(even: Event )
  {

    this.userAPiService.displayPopOver('termsOfService','');
  }

}
