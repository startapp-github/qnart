import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyWritePageRoutingModule } from './my-write-routing.module';

import { MyWritePage } from './my-write.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyWritePageRoutingModule
  ],
  declarations: [MyWritePage]
})
export class MyWritePageModule {}
