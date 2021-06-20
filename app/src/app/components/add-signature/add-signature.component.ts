import { Component, OnInit, ViewChild, HostListener, ElementRef, AfterViewInit } from '@angular/core';
import SignaturePad from 'signature_pad';
// import { Base64ToGallery } from '@ionic-native/base64-to-gallery/ngx';
import {FormGroup} from '@angular/forms';
import { NavController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import {LoginRegisterPage} from '../../pages/login-register/login-register.page';

@Component({
  selector: 'app-add-signature',
  templateUrl: './add-signature.component.html',
  styleUrls: ['./add-signature.component.scss'],
})
export class AddSignatureComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: true }) signaturePadElement;
  signForm: FormGroup;
  signaturePad: any;
  canvasWidth: 150;
  canvasHeight: 150;
  public saveSign: string;
  constructor(
    private elementRef: ElementRef,
    public navCtrl: NavController,
    private router: Router,
    private modalCtrl: ModalController
  ) { }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.init();
  }
  ngOnInit(): void
  {
    this.init();
  }

  init()
  {
    const canvas: any = this.elementRef.nativeElement.querySelector('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 500;
    if (this.signaturePad) {
      this.signaturePad.clear(); // Clear the pad on init
    }
  }

  public ngAfterViewInit(): void {
    this.signaturePad = new SignaturePad(this.signaturePadElement.nativeElement);
    this.signaturePad.clear();
    this.signaturePad.penColor = 'rgb(56,128,255)';
  }

  save() {
    this.saveSign = this.signaturePad.toDataURL();
    console.log(this.signaturePad.toDataURL());
    this.download(this.saveSign, "Signature");
    //console.log(this.saveSign);
    // this.navCtrl.push(LoginRegisterPage,{saveSign: this.saveSign});
  }

  done()
  {
    this.modalCtrl.dismiss({
      "signature": this.saveSign,
      //"registerBtn" : false
  });
    // // this.navCtrl.navigateBack('/login');
    // this.modalCtrl.create({
    //   component: LoginRegisterPage
    // }).then((modal) => {
    //   modal.present();
    // });
  }

  download(data, filename) {
    const file = this.dataURItoBlob(data);
    if (window.navigator.msSaveOrOpenBlob) // IE10+
      window.navigator.msSaveOrOpenBlob(file, "Signature");
    else { // Others
      var a = document.createElement("a"),
        url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }
  }

  dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], {type: mimeString});


  }

  isCanvasBlank(): boolean {
    if (this.signaturePad) {
      return this.signaturePad.isEmpty() ? true : false;
    }
  }

  clear() {
    this.signaturePad.clear();
  }

  undo() {
    const data = this.signaturePad.toData();
    if (data) {
      data.pop(); // remove the last dot or line
      this.signaturePad.fromData(data);
    }
  }
}
