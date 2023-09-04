import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReviewWritePageRoutingModule } from './review-write-routing.module';

import { ReviewWritePage } from './review-write.page';
import { MbscModule } from '@mobiscroll/angular';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ReviewWritePageRoutingModule, MbscModule],
  declarations: [ReviewWritePage],
})
export class ReviewWritePageModule {}
