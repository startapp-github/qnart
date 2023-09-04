import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-notice-detail',
  templateUrl: './notice-detail.page.html',
  styleUrls: ['./notice-detail.page.scss'],
})
export class NoticeDetailPage implements OnInit {
  noticeId = '';
  notice: any;

  constructor(
    public navCtrl: NavController,
    private dataService: DataService,
    private route: ActivatedRoute
  ) {
    this.noticeId = this.route.snapshot.queryParams.noticeId;
  }

  async ngOnInit() {
    this.notice = await this.dataService.getNoticesById(this.noticeId);
  }

  goBack() {
    this.navCtrl.pop();
  }
}
