/** @format */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RedundDetailCartPageRoutingModule } from './redund-detail-cart-routing.module';

import { RedundDetailCartPage } from './redund-detail-cart.page';
import { PipesModule } from 'src/app/pipes/pipe.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RedundDetailCartPageRoutingModule, PipesModule],
  declarations: [RedundDetailCartPage],
})
export class RedundDetailCartPageModule {}
