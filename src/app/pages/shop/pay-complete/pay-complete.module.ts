import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PayCompletePageRoutingModule } from './pay-complete-routing.module';

import { PayCompletePage } from './pay-complete.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PayCompletePageRoutingModule
  ],
  declarations: [PayCompletePage]
})
export class PayCompletePageModule {}
