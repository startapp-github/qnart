/** @format */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EventDetailPageRoutingModule } from './event-detail-routing.module';

import { EventDetailPage } from './event-detail.page';
import { PipesModule } from 'src/app/pipes/pipe.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, PipesModule, EventDetailPageRoutingModule],
  declarations: [EventDetailPage],
})
export class EventDetailPageModule {}
