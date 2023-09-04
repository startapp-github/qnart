/** @format */

import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { Inquiry } from 'src/app/models/inquiry.model';
import { DataService } from 'src/app/services/data.service';
import { InquiryWritePage } from '../inquiry-write/inquiry-write.page';

@Component({
  selector: 'app-inquiry',
  templateUrl: './inquiry.page.html',
  styleUrls: ['./inquiry.page.scss'],
})
export class InquiryPage implements OnInit {
  inquiryList: Inquiry[];
  constructor(
    public navCtrl: NavController,
    private modalCtrl: ModalController,
    private dataService: DataService
  ) {}

  ngOnInit() {}

  async goInquiryWrite() {
    const modal = await this.modalCtrl.create({
      component: InquiryWritePage,
    });

    modal.present();
    modal.onDidDismiss().then(async () => {
      this.inquiryList = await this.dataService.getInquiriesByUserId();
    });
  }

  async ionViewWillEnter() {
    await this.dataService.inIt();
    this.inquiryList = await this.dataService.getInquiriesByUserId();
  }

  goInquiryDetail(inquiry: Inquiry) {
    this.navCtrl.navigateForward(['/inquiry-detail'], {
      queryParams: { inquiryId: inquiry.id },
    });
  }
}
