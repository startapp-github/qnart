import { Cart } from './cart';

export interface Order {
  id: string;
  dateCreated: string;
  uid: string;
  shipmentStatus:
    | '배송준비중'
    | '배송중'
    | '배송완료'
    | '취소대기'
    | '취소완료'
    | string;
  shipmentDate: string;
  cartIds: Array<string | Cart>;
  depositStatus: boolean;
  depositDate?: Date | string;
  totalPrice: number;
  deleteSwitch: boolean;
  address: string;
  addressDetail: string;
  deliveryPhone: string;
  recipient: string;
  adminDeleteSwitch: boolean;
  payment?: Payment;
}

export interface Payment {
  imp_uid: string;
  merchant_uid: string;
  payMethod: string;
}

// imp_success
// :
// "true"
// imp_uid
// :
// "imp_757717648215"
// merchant_uid
// :
// "merchant_1674180718466"
