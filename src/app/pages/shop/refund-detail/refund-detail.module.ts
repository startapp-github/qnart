/** @format */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RefundDetailPageRoutingModule } from './refund-detail-routing.module';

import { RefundDetailPage } from './refund-detail.page';
import { PipesModule } from 'src/app/pipes/pipe.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RefundDetailPageRoutingModule, PipesModule],
  declarations: [RefundDetailPage],
})
export class RefundDetailPageModule {}
