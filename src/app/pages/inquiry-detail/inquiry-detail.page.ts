/** @format */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Inquiry } from 'src/app/models/inquiry.model';
import { AlertService } from 'src/app/services/alert.service';
import { DataService } from 'src/app/services/data.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-inquiry-detail',
  templateUrl: './inquiry-detail.page.html',
  styleUrls: ['./inquiry-detail.page.scss'],
})
export class InquiryDetailPage implements OnInit {
  inquiry: Inquiry;
  constructor(
    private alert: AlertService,
    public navCtrl: NavController,
    private route: ActivatedRoute,
    private dataService: DataService,
    public userService: UserService
  ) {}

  async ngOnInit() {
    this.userService.inIt();
    const inquiryId = this.route.snapshot.queryParams.inquiryId;
    this.inquiry = await this.dataService.getInquiryById(inquiryId);
  }

  inquiryDelete() {
    this.alert
      .cancelOkBtn('alert confirm', `1:1 문의를 삭제하시겠습니까?`)
      .then((ok) => {
        if (ok) {
          this.dataService.deleteInquiryById(this.inquiry.id);
          this.navCtrl.back();
        }
      });
  }
}
