/** @format */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderListDetailPageRoutingModule } from './order-list-detail-routing.module';

import { OrderListDetailPage } from './order-list-detail.page';
import { PipesModule } from 'src/app/pipes/pipe.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, PipesModule, OrderListDetailPageRoutingModule],
  declarations: [OrderListDetailPage],
})
export class OrderListDetailPageModule {}
