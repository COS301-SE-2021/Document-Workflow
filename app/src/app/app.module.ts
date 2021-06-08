import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Browser } from '@capacitor/browser'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { LoginRegisterComponent } from './login-register/login-register.component';
import { ViewWorkflowComponent } from './view-workflow/view-workflow.component';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ViewAllWorkflowsComponent } from './view-all-workflows/view-all-workflows.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginRegisterComponent,
    ViewWorkflowComponent,
    ViewAllWorkflowsComponent
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
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
