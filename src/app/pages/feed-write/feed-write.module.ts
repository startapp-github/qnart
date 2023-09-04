import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FeedWritePageRoutingModule } from './feed-write-routing.module';

import { FeedWritePage } from './feed-write.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FeedWritePageRoutingModule
  ],
  declarations: [FeedWritePage]
})
export class FeedWritePageModule {}
