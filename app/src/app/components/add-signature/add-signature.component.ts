import { Component, OnInit, ViewChild, HostListener, ElementRef, AfterViewInit } from '@angular/core';
import SignaturePad from 'signature_pad';
// import { Base64ToGallery } from '@ionic-native/base64-to-gallery/ngx';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'app-add-signature',
  templateUrl: './add-signature.component.html',
  styleUrls: ['./add-signature.component.scss'],
})
export class AddSignatureComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: true }) signaturePadElement;
  signForm: FormGroup;
  signaturePad: any;
  canvasWidth: 300;
  canvasHeight: 200;

  constructor(private elementRef: ElementRef,
              // private base64ToGallery: Base64ToGallery
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
    canvas.height = window.innerHeight - 140;
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
    console.log(this.signaturePad.toDataURL());
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
