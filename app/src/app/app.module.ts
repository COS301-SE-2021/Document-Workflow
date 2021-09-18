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


//Components
import { AddSignatureComponent } from './components/add-signature/add-signature.component';
import { UserNotificationsComponent } from './components/user-notifications/user-notifications.component';
import { DocumentActionAreaComponent } from './components/document-action-area/document-action-area.component';
import { Logger } from './Services/Logger';
@NgModule({
  declarations: [
    AppComponent,
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
