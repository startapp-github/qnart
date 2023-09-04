/** @format */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FeedDetailPageRoutingModule } from './feed-detail-routing.module';

import { FeedDetailPage } from './feed-detail.page';
import { PipesModule } from 'src/app/pipes/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FeedDetailPageRoutingModule,
    PipesModule,
  ],
  declarations: [FeedDetailPage],
})
export class FeedDetailPageModule {}
