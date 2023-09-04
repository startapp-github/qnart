/** @format */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FeedReplyPageRoutingModule } from './feed-reply-routing.module';
import { FeedReplyPage } from './feed-reply.page';
import { PipesModule } from 'src/app/pipes/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FeedReplyPageRoutingModule,
    PipesModule,
  ],
  declarations: [FeedReplyPage],
})
export class FeedReplyPageModule {}
