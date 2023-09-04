import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductInquiryPageRoutingModule } from './product-inquiry-routing.module';

import { ProductInquiryPage } from './product-inquiry.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductInquiryPageRoutingModule
  ],
  declarations: [ProductInquiryPage]
})
export class ProductInquiryPageModule {}
