import {
  Component,
  Input,
  OnInit,
  ɵɵsanitizeUrlOrResourceUrl,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AbstractControlOptions, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User, UserAPIService } from '../../Services/User/user-api.service';
import { match } from '../../Services/Validators/match.validator';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';
import { VerifyEmail } from '../../Services/Validators/verifyEmail.validator';
import * as Cookies from 'js-cookie';
export interface contact {
  email: string;
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
})
export class UserProfilePage implements OnInit {
  user: User;
  userForm: FormGroup;
  addContactForm: FormGroup;
  srcFile: any;
  ready: boolean;
  sizeMe: boolean;

  ready1: boolean;
  ready2: boolean;
  ready3: boolean;

  screenNum: number =1;

  contacts: contact[] = [];
  pendingContacts: contact[] = [];
  blockedContacts: contact[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userApiService: UserAPIService,
    private plat: Platform
  ) {}

  async ngOnInit() {
    this.ready = false;
    this.ready1 = false;
    this.ready2 = false;
    this.ready3 = false;
    this.userApiService.dismissLoading();
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
    await this.getUser();
    await this.getContactInformation();

    if (this.plat.width() > 572) {
      this.sizeMe = false;
    } else {
      this.sizeMe = true;
    }

    this.addContactForm = this.fb.group({
      contact: ['', [Validators.required, Validators.email]],
    });
  }

  async getUser() {
    const verifierEmail = new VerifyEmail(this.userApiService);
    this.ready = false;
    await this.userApiService.getUserDetails(async (response) => {
      if (response) {
         (this.user = response.data);
        console.log(this.user);
        const formOptions: AbstractControlOptions = {
          validators: match('password', 'confirmPassword'),
        };

        this.userForm = this.fb.group(
          {
            firstName: [response.data.name, [Validators.required]],
            lastName: [response.data.surname, [Validators.required]],
            initials: [response.data.initials, [Validators.required]],
            email: [
              response.data.email,
              [ Validators.email,
                Validators.required,
                Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")],
              [verifierEmail.verifyEmail.bind(verifierEmail)],
            ],
            password: ['', [Validators.nullValidator]],
            confirmPassword: ['', [Validators.nullValidator]],
          },
          formOptions
        );

        this.srcFile = 'data:image/png;base64,' + response.data.signature;
        this.ready = true;
      }
    });
  }

  async submit() {
    const use = this.userForm.value;
    await this.userApiService.editUserProfile(use, (response)=>{
      if(response){
        console.log(response);
      }
    });
  }

  async getContactInformation() {
    this.userApiService.displayLoading();


    await this.getContacts();
    await this.getContactRequests();
    await this.getBlockedUsers();

  }

  async getContacts(){
    this.userApiService.displayLoading();
    this.contacts = [];
    await this.userApiService.getContacts((response) => {
      if (response) {
        if (response.status === 'success') {
          this.contacts = response.data.contacts;
        } else {
          this.userApiService.displayPopOver('Error', 'Failed to get users');
        }
        this.ready1 = true;
        this.userApiService.dismissLoading();
        this.dismissLoader();
      }
    });
  }

  async getContactRequests(){
    this.userApiService.displayLoading();
    this.pendingContacts = [];
    await this.userApiService.getContactRequests((response) => {
      console.log(response);
      if (response) {
        if (response.status === 'success') {
          this.pendingContacts = response.data.requests;
          console.log(this.pendingContacts);
        } else {
          this.userApiService.displayPopOver(
            'Error',
            'Failed to get pending users'
          );
        }
        this.ready2 = true;
        this.userApiService.dismissLoading();
        this.dismissLoader();
      }

    });
  }

  async getBlockedUsers(){
    this.userApiService.displayLoading();
    this.blockedContacts=[];
    await this.userApiService.getBlockedContacts((response) => {
      console.log(response);
      if (response) {
        if (response.status === 'success') {
          this.blockedContacts = response.data.contacts;
        } else {
          this.userApiService.displayPopOver(
            'Error',
            'Failed to get blocked users'
          );
        }
        this.ready3 = true;
        this.userApiService.dismissLoading();
        this.dismissLoader();
      }
    });
  }

  dismissLoader() {
    if (this.ready1 && this.ready2 && this.ready3) {
      this.userApiService.dismissLoading();
    }
  }

  async deleteContact(contact) {
    await this.userApiService.deleteContact(contact, async (response) => {
      if (response.status === 'success') {
        await this.getContacts();
        this.userApiService.displayPopOver('Success', 'deleted the user');
      } else {
        this.userApiService.displayPopOver(
          'Error',
          'Failed to delete the user'
        );
      }
    });
  }

  async rejectContactRequest(contact) {
    console.log(contact);
    await this.userApiService.rejectContactRequest(contact, async (response) => {
      if (response.status === 'success') {
        await this.getContactRequests();
        this.userApiService.displayPopOver('Success', 'rejected the user');
      } else {
        this.userApiService.displayPopOver(
          'Error',
          'Failed to reject the users'
        );
      }
    });
  }

  async acceptContactRequest(contact) {
    console.log(contact);
    await this.userApiService.acceptContactRequest(contact, async (response) => {
      if (response.status === 'success') {
        await this.getContacts();
        await this.getContactRequests();
        this.userApiService.displayPopOver('Success', 'Added the user');
      } else {
        this.userApiService.displayPopOver('Error', 'Failed to add users');
      }
    });
  }

  async blockUser(contact) {
    await this.userApiService.blockUser(contact, async (response) => {
      if (response) {
        if (response.status === 'success') {
          await this.getContacts();
          await this.getBlockedUsers();
          this.userApiService.displayPopOver('Success', 'Blocked the user');
        } else {
          this.userApiService.displayPopOver('Failed', 'To block the user');
        }
      }
    });
  }

  async unBlockUser(contact) {
    await this.userApiService.unblockUser(contact, async (response) => {
      if (response.status === 'success') {
        await this.getBlockedUsers();
        await this.getContacts();
        this.userApiService.displayPopOver('Success', 'unblocked the user');
      } else {
        this.userApiService.displayPopOver('Failed', 'To unblock the user');
      }
    });
  }

  async sendContactRequest(contact) {
    console.log(contact);
    await this.userApiService.sendContactRequest(
      contact.contact,
      (response) => {
        if (response) {
          if (response.status === 'success') {
            this.userApiService.displayPopOver(
              'Success',
              'Sent the request to the user'
            );
          } else {
            this.userApiService.displayPopOver(
              'Failed',
              'To send friend request'
            );
          }
        }
      }
    );
  }

  sendFriendRequest() {
    this.sendContactRequest(this.addContactForm.value);
  }

  changeToProfile(){
    this.screenNum = 1;
  }

  changeToFriends(){
    this.screenNum = 2;
  }

  changeToRequest(){
    this.screenNum = 3;
  }
}
