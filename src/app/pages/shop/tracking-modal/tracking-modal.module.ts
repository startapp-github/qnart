import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TrackingModalPageRoutingModule } from './tracking-modal-routing.module';

import { TrackingModalPage } from './tracking-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrackingModalPageRoutingModule
  ],
  declarations: [TrackingModalPage]
})
export class TrackingModalPageModule {}
