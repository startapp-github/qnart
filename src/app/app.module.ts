import { MbscModule } from '@mobiscroll/angular';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

/// firebase ///

import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { CoreModule } from './core/core.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Camera } from '@awesome-cordova-plugins/camera/ngx';
import { OpenNativeSettings } from '@awesome-cordova-plugins/open-native-settings/ngx';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { PushDetailComponent } from './pages/push-detail/push-detail.component';
import { MatDialogModule } from '@angular/material/dialog';
@NgModule({
  declarations: [AppComponent, PushDetailComponent],
  entryComponents: [PushDetailComponent],
  imports: [
    MbscModule,
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    BrowserModule,
    IonicModule.forRoot({ mode: 'ios' }),
    AppRoutingModule,
    AngularFireStorageModule,
    AngularFirestoreModule,
    CoreModule,
    HttpClientModule,
    MatDialogModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Camera,
    OpenNativeSettings,
    ImagePicker,
    InAppBrowser,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
