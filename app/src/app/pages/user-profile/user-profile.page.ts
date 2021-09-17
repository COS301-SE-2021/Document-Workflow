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
    // todo remove this below
    this.userForm = this.fb.group({
      firstName: [, [Validators.required]],
      lastName: [, [Validators.required]],
      initials: [, [Validators.required]],
      email: [, [Validators.required]],
      password: ['', [Validators.nullValidator]],
      confirmPassword: ['', [Validators.nullValidator]],
    });


    // let email1:contact;
    // let email2:contact;
    // let email3:contact;
    // let email4:contact;

    // email1={email:"brenton.stroberg@yahoo.co.za"};
    // email2={email:"timothy@yahoo.co.za"};
    // email3={email:"bev@yahoo.co.za"};
    // email4={email:"delaray@yahoo.co.za"};

    // this.pendingContacts.push(email1);
    // this.pendingContacts.push(email2);
    // this.pendingContacts.push(email3);
    // this.pendingContacts.push(email4);

    // this.contacts.push(email1);
    // this.contacts.push(email2);
    // this.contacts.push(email3);
    // this.contacts.push(email4);

    // this.blockedContacts.push(email1);
    // this.blockedContacts.push(email2);
    // this.blockedContacts.push(email3);
    // this.blockedContacts.push(email4);
  }

  async getUser() {
    this.ready = false;
    await this.userApiService.getUserDetails(async (response) => {
      if (response) {
        await (this.user = response.data);
        console.log(this.user);
        const formOptions: AbstractControlOptions = {
          validators: match('password', 'confirmPassword'),
        };

        this.userForm = this.fb.group(
          {
            firstName: [response.data.name, [Validators.required]],
            lastName: [response.data.surname, [Validators.required]],
            initials: [response.data.initials, [Validators.required]],
            email: [response.data.email, [Validators.required]],
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

  submit() {
    const use = this.userForm.value;
    if (use.password === '') {
      //if the user hasnt changed the password
    }
    console.log(this.user);
  }

  back() {
    this.router.navigate(['home']);
  }

  async getContactInformation() {
    await this.userApiService.getContacts((response) => {
      console.log(response);
      if (response.status === 'success') {
        this.contacts = response.data.contacts;
      } else {
        this.userApiService.displayPopOver('Error', 'Failed to get users');
      }
    });
    await this.userApiService.getContactRequests((response) => {
      console.log(response);
      if (response.status === 'success') {
        this.pendingContacts = response.data.requests;
        console.log(this.pendingContacts);
      } else {
        this.userApiService.displayPopOver(
          'Error',
          'Failed to get pending users'
        );
      }
    });
    await this.userApiService.getBlockedContacts((response) => {
      console.log(response);
      if (response.status === 'success') {
        this.blockedContacts = response.data.contacts;
        console.log(this.blockedContacts);
      } else {
        this.userApiService.displayPopOver(
          'Error',
          'Failed to get blocked users'
        );
      }
    });
  }

  async deleteContact(contact) {
    await this.userApiService.deleteContact(contact, (response) => {
      if (response.status === 'success') {
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
    await this.userApiService.rejectContactRequest(contact, (response) => {
      if (response.status === 'success') {
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
    await this.userApiService.acceptContactRequest(contact, (response) => {
      if (response.status === 'success') {
        this.userApiService.displayPopOver('Success', 'Added the user');
      } else {
        this.userApiService.displayPopOver('Error', 'Failed to add users');
      }
    });
  }

  async blockUser(contact) {
    await this.userApiService.blockUser(contact, (response) => {
      if (response) {
        if (response.status === 'success') {
          this.userApiService.displayPopOver('Success', 'Blocked the user');
        } else {
          this.userApiService.displayPopOver('Failed', 'To block the user');
        }
      }
    });
  }

  async unBlockUser(contact) {
    await this.userApiService.unblockUser(contact, (response) => {
      if (response.status === 'success') {
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
}
