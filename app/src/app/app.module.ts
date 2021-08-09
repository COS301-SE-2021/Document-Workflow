import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy, NavController, NavParams } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';


// import {SignaturePadModule} from 'angular2-signaturepad';
import { HttpClientModule } from '@angular/common/http';

//pdf viewer
import { PdfViewerModule } from 'ng2-pdf-viewer';

//Components
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { UpdateUserComponent } from './components/update-user/update-user.component';
import { AddWorkflowComponent } from './components/add-workflow/add-workflow.component';
import { AddSignatureComponent } from './components/add-signature/add-signature.component';
import { AddCommentComponent } from './components/add-comment/add-comment.component';
import { ConfirmSignaturesComponent } from './components/confirm-signatures/confirm-signatures.component';
import { UserNotificationsComponent } from './components/user-notifications/user-notifications.component';
import { ConfirmDeleteWorkflowComponent } from './components/confirm-delete-workflow/confirm-delete-workflow.component';
import { DocumentActionAreaComponent } from './components/document-action-area/document-action-area.component';
@NgModule({
  declarations: [
    AppComponent,
    ResetPasswordComponent,
    AddWorkflowComponent,
    UpdateUserComponent,
    AddSignatureComponent,
    AddCommentComponent,
    ConfirmSignaturesComponent,
    UserNotificationsComponent,
    ConfirmDeleteWorkflowComponent,
    DocumentActionAreaComponent
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
    NavParams
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
