/** @format */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecommendPageRoutingModule } from './recommend-routing.module';

import { RecommendPage } from './recommend.page';
import { PipesModule } from 'src/app/pipes/pipe.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RecommendPageRoutingModule, PipesModule],
  declarations: [RecommendPage],
})
export class RecommendPageModule {}
