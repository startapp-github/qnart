import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RefundListPageRoutingModule } from './refund-list-routing.module';

import { RefundListPage } from './refund-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RefundListPageRoutingModule
  ],
  declarations: [RefundListPage]
})
export class RefundListPageModule {}
