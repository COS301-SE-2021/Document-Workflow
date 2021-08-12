import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';


@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage implements OnInit {

  sizeMe: boolean;

  constructor(
    private plat: Platform,
  ) { }

  ngOnInit() {
    if(this.plat.width() > 572){
      this.sizeMe = false;
    }else{
      this.sizeMe = true;
    }
  }

}
