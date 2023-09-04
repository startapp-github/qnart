import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RefundProductPageRoutingModule } from './refund-product-routing.module';

import { RefundProductPage } from './refund-product.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RefundProductPageRoutingModule
  ],
  declarations: [RefundProductPage]
})
export class RefundProductPageModule {}
