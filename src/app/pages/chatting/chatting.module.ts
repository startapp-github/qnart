/** @format */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChattingPageRoutingModule } from './chatting-routing.module';

import { ChattingPage } from './chatting.page';
import { PipesModule } from 'src/app/pipes/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChattingPageRoutingModule,
    PipesModule,
  ],
  declarations: [ChattingPage],
})
export class ChattingPageModule {}
