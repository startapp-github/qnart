import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExpiredServicePageRoutingModule } from './expired-service-routing.module';

import { ExpiredServicePage } from './expired-service.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExpiredServicePageRoutingModule
  ],
  declarations: [ExpiredServicePage]
})
export class ExpiredServicePageModule {}
