import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyinfoAddressPageRoutingModule } from './myinfo-address-routing.module';

import { MyinfoAddressPage } from './myinfo-address.page';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, MyinfoAddressPageRoutingModule, ReactiveFormsModule],
  declarations: [MyinfoAddressPage],
})
export class MyinfoAddressPageModule {}
