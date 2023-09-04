/** @format */

import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Faq } from 'src/app/models/faq.models';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-common-question',
  templateUrl: './common-question.page.html',
  styleUrls: ['./common-question.page.scss'],
})
export class CommonQuestionPage implements OnInit {
  faqList: Faq[];
  constructor(
    public navCtrl: NavController,
    private dataService: DataService
  ) {}

  async ngOnInit() {
    this.faqList = await this.dataService.getAllFaqs();
  }

  goBack() {
    this.navCtrl.back();
  }
}
