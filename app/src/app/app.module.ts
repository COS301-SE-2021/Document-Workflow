import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import {
  IonicModule,
  IonicRouteStrategy,
  NavController,
  NavParams,
} from '@ionic/angular';
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
import { AddSignatureComponent } from './components/add-signature/add-signature.component';
import { UserNotificationsComponent } from './components/user-notifications/user-notifications.component';
import { DocumentActionAreaComponent } from './components/document-action-area/document-action-area.component';
import { Logger } from './Services/Logger';
import { SwiperModule } from "swiper/angular";
@NgModule({
  declarations: [
    AppComponent,
    ResetPasswordComponent,
    AddSignatureComponent,
    UserNotificationsComponent,
    DocumentActionAreaComponent,
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
    PdfViewerModule
  ],
  providers: [
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy,
    },
    NavParams,
    Logger,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
