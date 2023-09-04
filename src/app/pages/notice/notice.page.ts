import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-notice',
  templateUrl: './notice.page.html',
  styleUrls: ['./notice.page.scss'],
})
export class NoticePage implements OnInit {
  noticeList: any[];

  constructor(private navc: NavController, private dataService: DataService) {}

  async ngOnInit() {
    this.noticeList = await this.dataService.getAllNotices();
    console.log(this.noticeList);
  }
  goNoticeDetail(item) {
    this.navc.navigateForward('/notice-detail', {
      queryParams: {
        noticeId: item.id,
      },
    });
  }
}
