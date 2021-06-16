import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';


import { HttpClient, HttpClientModule } from '@angular/common/http';
import {SignaturePadModule} from 'angular2-signaturepad';

//Components
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { UpdateUserComponent } from './components/update-user/update-user.component';
import { AddWorkflowComponent } from './components/add-workflow/add-workflow.component';
import { AddSignatureComponent } from './components/add-signature/add-signature.component';


//pdf viewer
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { EditWorkflowComponent } from './components/edit-workflow/edit-workflow.component';
import { AddCommentComponent } from './components/add-comment/add-comment.component';

@NgModule({
  declarations: [
    AppComponent,
    ResetPasswordComponent,
    AddWorkflowComponent,
    UpdateUserComponent,
    AddSignatureComponent,
    EditWorkflowComponent,
    AddCommentComponent
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
    SignaturePadModule,
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
