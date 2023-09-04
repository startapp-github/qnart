/** @format */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderListPageRoutingModule } from './order-list-routing.module';

import { OrderListPage } from './order-list.page';
import { PipesModule } from 'src/app/pipes/pipe.module';

@NgModule({
  imports: [CommonModule, FormsModule, PipesModule, IonicModule, OrderListPageRoutingModule],
  declarations: [OrderListPage],
})
export class OrderListPageModule {}
