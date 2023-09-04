import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RefundReasonPageRoutingModule } from './refund-reason-routing.module';

import { RefundReasonPage } from './refund-reason.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RefundReasonPageRoutingModule
  ],
  declarations: [RefundReasonPage]
})
export class RefundReasonPageModule {}
