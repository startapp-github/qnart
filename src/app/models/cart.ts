export interface Cart {
  id: string;
  dateCreated: string;
  uid: string;
  productId: string | any;
  count: number;
  orderDoneSwitch: boolean;
  options: Array<any> | any;
  productInfo: ProductInfo;
  productStatus?: '취소' | '교환' | '반품' | string;
  doneSwitch: boolean; //취소 교환 반품일때
  reviewSwitch: boolean;
  deleteSwitch: boolean;
  reason?: string;
  detailReason?: string;
  reasonImages?: Array<any>;
  changeOptions?: Array<any>;
}

export interface ProductInfo {
  productName: string;
  price: number;
  discountPrice: number;
  discountRate: number;
  infoText: string;
  images: Array<string>;
}
