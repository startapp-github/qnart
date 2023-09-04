import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InquiryPageRoutingModule } from './inquiry-routing.module';

import { InquiryPage } from './inquiry.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InquiryPageRoutingModule
  ],
  declarations: [InquiryPage]
})
export class InquiryPageModule {}
