import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InquiryWritePageRoutingModule } from './inquiry-write-routing.module';

import { InquiryWritePage } from './inquiry-write.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InquiryWritePageRoutingModule
  ],
  declarations: [InquiryWritePage]
})
export class InquiryWritePageModule {}
