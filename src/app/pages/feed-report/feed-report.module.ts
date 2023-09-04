import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FeedReportPageRoutingModule } from './feed-report-routing.module';

import { FeedReportPage } from './feed-report.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FeedReportPageRoutingModule
  ],
  declarations: [FeedReportPage]
})
export class FeedReportPageModule {}
