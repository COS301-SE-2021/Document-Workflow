import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Browser } from '@capacitor/browser'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';


import { HttpClient, HttpClientModule } from '@angular/common/http';



//Components
import { PasswordResetComponent } from "./login-register/components/password-reset/password-reset.component";
import { RegisterLoginPopoverComponent } from './Popovers/register-login-popover/register-login-popover.component';
import { ViewAllWorkflowsComponent } from './view-all-workflows/view-all-workflows.component';
import { LoginRegisterComponent } from './login-register/login-register.component';
import { ViewWorkflowComponent } from './view-workflow/view-workflow.component';

import { DocumentAPIService } from "./Services/document-api.service";


//pdf viewer
import {PdfViewerModule} from 'ng2-pdf-viewer';



@NgModule({
  declarations: [
    AppComponent,
    LoginRegisterComponent,
    ViewWorkflowComponent,
    ViewAllWorkflowsComponent,
    PasswordResetComponent,
    RegisterLoginPopoverComponent
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    IonicStorageModule.forRoot(),
    HttpClientModule,
    PdfViewerModule,
  ],
  providers: [
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
