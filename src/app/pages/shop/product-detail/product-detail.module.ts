/** @format */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductDetailPageRoutingModule } from './product-detail-routing.module';

import { ProductDetailPage } from './product-detail.page';

import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { MbscModule } from '@mobiscroll/angular';
import { MatExpansionModule } from '@angular/material/expansion';
import { PipesModule } from 'src/app/pipes/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductDetailPageRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    MbscModule,
    MatExpansionModule,
    PipesModule,
  ],
  declarations: [ProductDetailPage],
})
export class ProductDetailPageModule {}
