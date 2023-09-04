/** @format */

import { Component, OnInit } from '@angular/core';
import { IonTextarea, ModalController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { DataService } from 'src/app/services/data.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-inquiry-write',
  templateUrl: './inquiry-write.page.html',
  styleUrls: ['./inquiry-write.page.scss'],
})
export class InquiryWritePage implements OnInit {
  title;
  text;
  constructor(
    private modalCtrl: ModalController,
    private alert: AlertService,
    public dataService: DataService,
    private load: LoadingService
  ) {}

  ngOnInit() {}

  async writeUpload() {
    this.load.load();
    await this.dataService.updateInquiry(this.title, this.text);
    this.load.hide();
    this.modalCtrl.dismiss();
    this.alert.presentToast('문의글이 등록되었습니다.', 'toast', 1000);
  }

  // 모달 닫기
  cancel() {
    this.alert
      .cancelOkBtn(
        'alert confirm',
        `내용이 저장되지 않습니다.\n글쓰기를 종료하시겠습니까?`
      )
      .then((ok) => {
        if (ok) {
          this.modalCtrl.dismiss();
        }
      });
  }

  // 포커스
  setFocus(textarea: IonTextarea) {
    textarea.setFocus();
    console.log('textarea', textarea);
  }
}
