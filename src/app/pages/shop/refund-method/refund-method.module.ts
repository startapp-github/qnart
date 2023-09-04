import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RefundMethodPageRoutingModule } from './refund-method-routing.module';

import { RefundMethodPage } from './refund-method.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RefundMethodPageRoutingModule
  ],
  declarations: [RefundMethodPage]
})
export class RefundMethodPageModule {}
