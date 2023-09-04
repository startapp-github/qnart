import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  Renderer2,
} from '@angular/core';
import { NavController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DbService } from 'src/app/services/db.service';
import { postcode } from 'src/assets/js/postcode.js';

@Component({
  selector: 'app-myinfo-address',
  templateUrl: './myinfo-address.page.html',
  styleUrls: ['./myinfo-address.page.scss'],
})
export class MyinfoAddressPage implements OnInit {
  user: any;
  @ViewChild('daum_popup', { read: ElementRef, static: true })
  popup: ElementRef;

  constructor(
    private renderer: Renderer2,
    private navc: NavController,
    private db: DbService,
    private authService: AuthService,
    private alertService: AlertService
  ) {}

  async ngOnInit() {
    this.user = await this.authService.getUser();
  }

  //백버튼
  async back() {
    this.alertService
      .cancelOkBtn(
        'alert confirm',
        `작성하신 내용이 저장되지 않습니다.\n 그래도 나가시겠습니까?`
      )
      .then((ok) => {
        if (ok) {
          this.navc.pop();
        }
      });
  }

  //주소 팝업 닫기
  closeDaumPopup() {
    this.renderer.setStyle(this.popup.nativeElement, 'display', 'none');
  }

  //다음 주소 불러오기
  getAddress(): Promise<any> {
    return new Promise<any>((resolve) => {
      postcode(this.renderer, this.popup.nativeElement, (data: any) => {
        resolve(data);
      });
    });
  }

  // 주소검색 API
  openDaumPopup() {
    this.getAddress().then((data) => {
      this.user.address = data.roadAddress || data.autoRoadAddress;
      this.user.postCode = data.zonecode;
    });
  }

  //유효성 검사
  validation(type): boolean {
    let test: boolean;
    switch (type) {
      case 'recipient':
        const nameRule = /^[가-힣]{2,8}$/;
        test = nameRule.test(this.user.recipient);
        break;

      case 'deliveryPhone':
        const phoneRule = /^.*(?=^.{10,11}$)(?=.*[0-9]).*$/;
        test = phoneRule.test(this.user.deliveryPhone);
        break;
    }
    return test;
  }

  //주소록 정보 저장 업뎃
  save() {
    this.db
      .updateAt(`users/${this.user.id}`, {
        recipient: this.user.recipient,
        address: this.user.address,
        addressDetail: this.user.addressDetail,
        deliveryPhone: this.user.deliveryPhone,
        postCode: this.user.postCode,
      })
      .then(() => {
        this.navc.pop();
        this.saveToast();
      });
  }

  saveToast() {
    this.alertService.toast('주소록 저장했습니다.', 'toast');
  }
}
