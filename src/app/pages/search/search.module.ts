/** @format */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchPageRoutingModule } from './search-routing.module';

import { SearchPage } from './search.page';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { PipesModule } from 'src/app/pipes/pipe.module';

@NgModule({
  imports: [
    Ng2SearchPipeModule,
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    SearchPageRoutingModule,
  ],
  declarations: [SearchPage],
})
export class SearchPageModule {}
