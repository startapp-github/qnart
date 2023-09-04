import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RefundReasonCompletePageRoutingModule } from './refund-reason-complete-routing.module';

import { RefundReasonCompletePage } from './refund-reason-complete.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RefundReasonCompletePageRoutingModule
  ],
  declarations: [RefundReasonCompletePage]
})
export class RefundReasonCompletePageModule {}
