import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CommonQuestionPageRoutingModule } from './common-question-routing.module';

import { CommonQuestionPage } from './common-question.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CommonQuestionPageRoutingModule,
  ],
  declarations: [CommonQuestionPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CommonQuestionPageModule {}
