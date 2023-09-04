/** @format */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PopularPageRoutingModule } from './popular-routing.module';

import { PopularPage } from './popular.page';
import { PipesModule } from 'src/app/pipes/pipe.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, PopularPageRoutingModule, PipesModule],
  declarations: [PopularPage],
})
export class PopularPageModule {}
