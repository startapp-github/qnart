import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductDetailPopupPageRoutingModule } from './product-detail-popup-routing.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { ProductDetailPopupPage } from './product-detail-popup.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ProductDetailPopupPageRoutingModule, MatSnackBarModule],
  declarations: [ProductDetailPopupPage],
})
export class ProductDetailPopupPageModule {}
