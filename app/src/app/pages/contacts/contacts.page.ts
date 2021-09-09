import { Component, OnInit } from '@angular/core';
import {AlertController, Platform} from '@ionic/angular';

import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import {User, UserAPIService,AddContactData} from '../../Services/User/user-api.service';
import { ActivatedRoute, Router } from '@angular/router';
import {values} from 'pdf-lib';
// import * as Cookies from 'js-cookie';
// import any = jasmine.any;
// import {resetFakeAsyncZone} from "@angular/core/testing";

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage implements OnInit {

  sizeMe: boolean;
  public addContactForm: FormGroup;
  usersArr: User[] = [];
  searchName: any;
  //mock for now
  public contatcsArr: any [] =[
    {id: 1, name: 'Tim'},
    {id:2, name: 'TOm'},
    {id:3, name: 'Morphy'},
    {id:4, name: 'Pieter'}
  ];
  public contatcsArr1: any [] =['mosa','tomas'];
  public contactList: any[];
  public tempContactList: any[];
  constructor(
    private plat: Platform,
    private formBuilder: FormBuilder,
    private user: User,
    private userAPIService: UserAPIService,
    private router: Router,
    private alertControl: AlertController
  ) {}
  async ngOnInit()
  {
    // this.userAPIService.getSearchResults().subscribe((response) =>
    // {
    //   this.usersArr=response;
    // });

    this.addContactForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // returns it's own FormGroup object, Name validation rule need
  //Provide user to dynamically add new contact in the contactList field
  initContactFields(): FormGroup
  {
    return this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  // Retrieves the form's existing contacts fields as a FormArray object.
  addNewContactList()
  {
    const control = <FormArray>this.addContactForm.controls.contacts;
    control.push(this.initContactFields());

    const inputTextCont = (document.getElementById('emailId') as HTMLInputElement).value;
    // const inputTextCont = (<HTMLInputElement>document.getElementById('emailId')).value;

    //check if text is not null
    // if(inputTextCont as HTMLFormElement)
    this.contatcsArr1.push(inputTextCont);
    let newContact = '';
    for (let t = 0; t < this.contatcsArr1.length; t++)
    {
      //add data to existing arr
      newContact = newContact + this.contatcsArr1[t] + '</br>';
    }

    //show contactList
    document.getElementById('listUpdate').innerHTML = newContact;
  }

  //Removing generated input fields is handled with the removeInputField() method
  removeInputField(i: number)
  {
    //edit??
    const control = <FormArray>this.addContactForm.controls.contacts;
    control.removeAt(i);
  }

  //call the logs from the submitted form data to browser console
  manage(val: any)
  {
    console.dir(val);
  }

  // async addContact()
  // {
  //   const nodes = document.forms["addCntct"].querySelectorAll("input[type='text']");
  //   var array = [].map.call(nodes, (item)=>{
  //     return {name : item.name, value : item.value};
  //   });
  //   console.log(array);
  // }
  // async addContact() {
  //   const contact = this.contacts.create();
  //   contact.name = new ContactName(null, 'Tim', 'Tom');
  //   contact.phoneNumbers = [new ContactField('mobile', '0712345678')];
  //   contact.emailAddress = [new ContactField('email', 'tim@jargon.com')];
  //   contact.save().then(
  //     () => console.log('Contact saved!', contact),
  //     (error: any) => console.error('Error saving contact.', error)
  //   );
  // }


  async filterList(evt)
  {
    this.contactList = this.tempContactList;
    const searchWord = evt.srcElement.value;

    if (!searchWord)
    {
      return;
    }
    // if(this.searchName == "")
    // {
    //   this.userAPIService.getSearchResults().subscribe((response) =>
    //   {
    //     this.usersArr=response;
    //   });
    // }
    // else
    // {
    //   this.usersArr = this.usersArr.filter(response =>
    //     {
    //       return response.searchName.toLocaleLowerCase().match(this.searchName.toLocaleLowerCase());
    //     });
    // }

    this.contactList = this.contactList.filter(searchedContact => {
      if (searchedContact.searchName && searchWord)
      {
        return (searchedContact.name.toLowerCase().indexOf(searchWord.toLowerCase()) > -1);
      }
    });
  }

  // Submit email from contact to db <backend>
  async submitAddContact(): Promise<void>
  {
    const addData: AddContactData ={email: this.addContactForm.value.addEmail};
    console.log(addData);

    //ToDo backend function >>> call submitContact:
    this.userAPIService.submitContact(addData, (response) => {
      if (response.status === 'success') {
        //localStorage.setItem('token', response.data.token);
        // Cookies.set('token', response.data.token, {expires: 1});
        this.userAPIService.displayPopOver('Success', 'Contact added successful');
      }
      else {
        console.log(response);
        this.userAPIService.displayPopOver(
          'Sumbission unsuccesful',
          'Email is incorrect'
        );
      }
    });
  }

//  Show if the contact request has been accepted
  async confirmStatus()
  {
    const confirmContact = await this.alertControl.create({
      header: 'Contact Request',
      message: 'Mosa@tuks.co.za would like to add you to their contacts',
      buttons: [
        {
          text: 'Reject',
          handler: () => {
            console.log('Contact rejected');
          }
        },
        {
          text: 'Accept',
          handler: () => {
            console.log('Contact accepted');
          }
        }
      ]
    });
    await confirmContact.present();
  }
}
