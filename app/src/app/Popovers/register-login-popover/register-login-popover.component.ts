import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register-login-popover',
  templateUrl: './register-login-popover.component.html',
  styleUrls: ['./register-login-popover.component.scss'],
})
export class RegisterLoginPopoverComponent implements OnInit {

  header: string;
  @Input("Message") message: string;
  term: boolean = false;
  loader: boolean = false;

  tosForm: FormGroup
  constructor(private formbuilder: FormBuilder) { }

  ngOnInit() {
    if(this.message==="load"){
      this.term = false;
      this.loader = true;
      this.message="";
    }else if(this.message === "termsOfService"){
      console.log("here");
      this.header ="Terms of Service";
      this.displayTermOfService();
      this.term = true;

      this.tosForm = this.formbuilder.group({
        reponse:['', [Validators.required]]
      })
    }else{
      this.term=false;
      this.header ="Message";
    }
  }

  displayTermOfService(){
    this.message="Conditions of Use \n\n We will provide their services to you, which are subject to the conditions stated below in this document."+
    "Every time you visit this website, use its services or make a purchase, you accept the following conditions. This is why we urge you to read them carefully."+
    "\n\nPrivacy Policy\n"+
    "Before you continue using our website we advise you to read our privacy policy [link to privacy policy] regarding our user data collection. It will help you better understand our practices.\n"+
    "\n\n<h2>Copyright<h2>\n"+
    "Content published on this website (digital downloads, images, texts, graphics, logos) is the property of [name] and/or its content creators and protected by international copyright laws."+
    "The entire compilation of the content found on this website is the exclusive property of [name], with copyright authorship for this compilation by [name]."+
    "\n\nCommunications\n"+
    "\n\nThe entire communication with us is electronic. Every time you send us an email or visit our website, you are going to be communicating with us."+
    "You hereby consent to receive communications from us. If you subscribe to the news on our website, you are going to receive regular emails from us. We will continue to communicate with"+
    "you by posting news and notices on our website and by sending you emails. You also agree that all notices, disclosures, agreements and other communications we provide to you"+
    "electronically meet the legal requirements that such communications be in writing."+
    "\n\nApplicable Law\n"+
    "By visiting this website, you agree that the laws of the [your location], without regard to principles of conflict laws, will govern these terms of service, or any dispute of any sort that might come between [name] and you, or its business partners and associates."+
    "\n\nDisputes\n"+
    "Any dispute related in any way to your visit to this website or to products you purchase from us shall be arbitrated by state or federal court [your location] and you consent to exclusive jurisdiction and venue of such courts."+
    "\n\nComments, Reviews, and Emails\n"+
    "Visitors may post content as long as it is not obscene, illegal, defamatory, threatening, infringing of intellectual property rights, invasive of privacy or injurious in any other way to third parties. Content has to be free"+
    "of software viruses, political campaign, and commercial solicitation."+
    "We reserve all rights (but not the obligation) to remove and/or edit such content. When you post your content, you grant [name] non-exclusive, royalty-free and irrevocable right to use,"+
    "reproduce, publish, modify such content throughout the world in any media."+
    "\n\nLicense and Site Access\n"+
    "We grant you a limited license to access and make personal use of this website. You are not allowed to download or modify it. This may be done only with written consent from us."+
    "\n\nUser Account\n"+
    "If you are an owner of an account on this website, you are solely responsible for maintaining the confidentiality of your private user details (username and password). You are responsible for all activities that occur under your account or password."+
    "We reserve all rights to terminate accounts, edit or remove content and cancel orders in their sole discretion.";
  }

}
