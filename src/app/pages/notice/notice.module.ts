import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NoticePageRoutingModule } from './notice-routing.module';

import { NoticePage } from './notice.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, NoticePageRoutingModule],
  declarations: [NoticePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NoticePageModule {}
