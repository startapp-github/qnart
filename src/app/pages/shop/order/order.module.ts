/** @format */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderPageRoutingModule } from './order-routing.module';

import { OrderPage } from './order.page';
import { PipesModule } from 'src/app/pipes/pipe.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, PipesModule, OrderPageRoutingModule],
  declarations: [OrderPage],
})
export class OrderPageModule {}
