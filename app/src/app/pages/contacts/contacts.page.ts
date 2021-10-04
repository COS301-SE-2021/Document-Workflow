import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import * as Cookies from 'js-cookie';
import { UserAPIService } from 'src/app/Services/User/user-api.service';
import { VerifyEmail } from 'src/app/Services/Validators/verifyEmail.validator';

// eslint-disable-next-line @typescript-eslint/naming-convention
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
  contacts: contact[] =[];
  pendingContacts: contact[] =[];
  blockedContacts: contact[] =[];

  addContactForm: FormGroup;

  constructor(
    private plat: Platform,
    private userApiService: UserAPIService,
    private route: Router,
    private fb: FormBuilder
  ) {}

  async ngOnInit() {
    const verifierEmail = new VerifyEmail(this.userApiService);
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

        },
        async (error) => {

          await this.route.navigate(['/login']);
          return;
        }
      );
    }

    this.addContactForm = this.fb.group({
      contact: ['',       [
        Validators.email,
        Validators.required,
        Validators.pattern(
          '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'
        ),
      ],
      [verifierEmail.verifyEmail.bind(verifierEmail)]],
    });
    await this.getContactInformation();

  }

  async getContactInformation() {
    await this.userApiService.getContacts((response) => {

      if (response.status === 'success') {
        this.contacts = response.data.contacts;
      } else {
        this.userApiService.displayPopOver('Error', 'Failed to get users');
      }
    });
    await this.userApiService.getContactRequests((response) => {

      if (response.status === 'success') {
        this.pendingContacts = response.data.requests;

      }else {
        this.userApiService.displayPopOver('Error', 'Failed to get pending users');
      }
    });
    await this.userApiService.getBlockedContacts((response) => {

      if (response.status === 'success') {
        this.blockedContacts = response.data.contacts;

      }else {
        this.userApiService.displayPopOver('Error', 'Failed to get blocked users');
      }
    });

  }

  async getUser() {
    await this.userApiService.getUserDetails(async (response) => {
      if (response) {
        this.user = response.data;
        this.userEmail = this.user.email;
      } else {
        this.userApiService.displayPopOver('Error', 'Failed to get users');
      }
    });
  }

  async deleteContact(contact) {
    await this.userApiService.deleteContact(contact, (response)=>{
      if(response.status === 'success'){
        this.userApiService.displayPopOver('Success','deleted the user');
      }else{
        this.userApiService.displayPopOver('Error', 'Failed to delete the user');
      }

    });
  }

  async rejectContactRequest(contact){

    await this.userApiService.rejectContactRequest(contact, (response)=>{
      if(response.status === 'success'){
        this.userApiService.displayPopOver('Success','rejected the user');
      }else{
        this.userApiService.displayPopOver('Error', 'Failed to reject the users');
      }
    });
  }

  async acceptContactRequest(contact) {

    await this.userApiService.acceptContactRequest(contact, (response) => {
      if(response.status === 'success'){
        this.userApiService.displayPopOver('Success','Added the user');
      }else{
        this.userApiService.displayPopOver('Error', 'Failed to add users');
      }
    });
  }

  async blockUser(contact){
    await this.userApiService.blockUser(contact, (response)=>{
      if(response){
        if(response.status === 'success'){
          this.userApiService.displayPopOver('Success', 'Blocked the user');
        }else{
          this.userApiService.displayPopOver('Failed','To block the user');
        }
      }
    });
  }

  async unBlockUser(contact){
    await this.userApiService.unblockUser(contact, (response)=>{
      if(response.status === 'success'){
        this.userApiService.displayPopOver('Success', 'unblocked the user');
      }else{
        this.userApiService.displayPopOver('Failed','To unblock the user');
      }
    });
  }

  async sendContactRequest(contact){

    await this.userApiService.sendContactRequest(contact.contact, (response)=>{
        if(response){
          if(response.status === 'success'){
            this.userApiService.displayPopOver('Success', 'Sent the request to the user');
          }else{
            this.userApiService.displayPopOver('Failed','To send friend request');
          }
        }
    });
  }

  submit(){
    this.sendContactRequest(this.addContactForm.value);
  }
}
