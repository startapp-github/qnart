/** @format */

import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';

import {
  IMP,
  PaymentData,
  PayMethod,
  Response,
  PaymentOptions,
} from 'iamport-capacitor';
import { appSolutionInfo } from 'src/clientInfo/client-info';

// const USER_CODE: string = 'iamport'; // 가맹점 식별 코드
// const USER_CODE: string = 'imp82532117'; // 가맹점 식별 코드

const USER_CODE: string = appSolutionInfo.import_USER_CODE
  ? appSolutionInfo.import_USER_CODE
  : 'iamport';
@Injectable({
  providedIn: 'root',
})
export class IamportService {
  constructor(public http: HttpClient, private ngZone: NgZone) {}

  /**
   * 결제 함수
   * @param amount 거래 금액
   * @param pay_method 거래 방법
   * @param buyer_name 주문자 이름
   * @param buyer_tel 주문자 전화번호
   * @returns
   */
  payment(
    amount: string,
    pay_method: PayMethod,
    buyer_name: string,
    buyer_tel
  ) {
    return new Promise((resolve, reject) => {
      const imp = new IMP();
      const title = 'kn-mall';

      const date = new Date().getTime();
      const merchant_uid = 'merchant_' + date;

      const payInfo: PaymentData = {
        pg: 'html5_inicis', // PG사
        pay_method, // 결제수단
        name: `${title} kn-mall 결제`, // 주문명
        merchant_uid,
        amount: amount, // 결제금액
        buyer_name: buyer_name, // 구매자 이름
        buyer_tel: buyer_tel, // 구매자 연락처
        app_scheme: '', // 앱 URL 스킴
      };

      // const titleOptions = {
      //   text: `${title} kn-mall 결제`, // 타이틀
      //   textColor: '#ffffff', // 타이틀 색
      //   textSize: '20', // 타이틀 크기
      //   textAlignment: 'left', // 타이틀 정렬 유형
      //   backgroundColor: '#344e81', // 타이틀 배경색
      //   show: false, // 타이틀 유무
      //   leftButtonType: 'back', // 왼쪽 버튼 유형
      //   leftButtonColor: '#ffffff', // 왼쪽 버튼 색
      //   rightButtonType: 'close', // 오른쪽 버튼 유형
      //   rightButtonColor: '#ffffff', // 오른쪽 버튼 색
      // };

      const params: PaymentOptions = {
        userCode: USER_CODE,
        data: payInfo,
        callback: (rsp: Response) => {
          this.ngZone.run(() => {
            if (rsp.imp_success === 'true') {
              resolve(rsp);
            } else {
              let msg = '결제에 실패하였습니다.';
              msg += '에러내용 : ' + rsp.error_msg;
              reject(msg);
            }
          });
        },
        callbackOnBack: () => {
          reject('결제를 중단하셨습니다.');
        },
      };
      imp.payment(params).then((response) => {
        console.log({ response });

        if (response) {
          //결제 성공
          console.log(response);
          resolve(response);
        } else {
          alert('결제실패 : ' + response);
        }
      });
    });
  }
}
