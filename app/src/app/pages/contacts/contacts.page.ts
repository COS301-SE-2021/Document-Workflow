import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import * as Cookies from 'js-cookie';
import { UserAPIService } from 'src/app/Services/User/user-api.service';

export interface contact {
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
  contacts: contact[] =[];

  addContact: FormGroup;

  constructor(
    private plat: Platform,
    private userApiService: UserAPIService,
    private route: Router,
    private fb: FormBuilder
  ) {}

  async ngOnInit() {
    if (this.plat.width() > 572) {
      this.sizeMe = false;
    } else {
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

    this.addContact = this.fb.group({
      workflowName: ['', [Validators.required]],
    });

    await this.getContactInformation();
  }

  async getContactInformation() {
    await this.userApiService.getContacts((response) => {
      console.log(response);
      if (response.status === 'success') {
      } else {
        this.userApiService.displayPopOver('error', 'Failed to get users');
      }
    });
    await this.userApiService.getContactRequests((response) => {
      console.log(response);
      if (response.status === 'success') {
      }
    });
  }

  async getUser() {
    await this.userApiService.getUserDetails(async (response) => {
      if (response) {
        this.user = response.data;
        this.userEmail = this.user.email;
      } else {
        this.userApiService.displayPopOver('error', 'Failed to get users');
      }
    });
  }

  async deleteContact(contact) {
    await this.userApiService.deleteContact(contact, (response)=>{

    })
  }

  async acceptContactRequest(contact) {
    await this.userApiService.acceptContactRequest(contact, (response) => {});
  }

  async blockUser(contact){
    await this.userApiService.blockUser(contact, (response)=>{

    })
  }

  async unBlockUser(contact){
    await this.userApiService.unblockUser(contact, (response)=>{

    })
  }

  async sendContactRequest(contact){
    await this.userApiService.sendContactRequest(contact, (reponse)=>{

    })
  }
}
