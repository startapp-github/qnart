import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CommentCorrectPageRoutingModule } from './comment-correct-routing.module';

import { CommentCorrectPage } from './comment-correct.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CommentCorrectPageRoutingModule
  ],
  declarations: [CommentCorrectPage]
})
export class CommentCorrectPageModule {}
