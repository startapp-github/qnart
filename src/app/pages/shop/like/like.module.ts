/** @format */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LikePageRoutingModule } from './like-routing.module';

import { LikePage } from './like.page';
import { PipesModule } from 'src/app/pipes/pipe.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, PipesModule, LikePageRoutingModule],
  declarations: [LikePage],
})
export class LikePageModule {}
