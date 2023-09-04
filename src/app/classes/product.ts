export interface selectOption {
  title: string;
  value: string;
}

interface address {
  name: string;
  address: string;
  addressNum: string;
  phone: string;
}

export interface options {
  title: string;
  values: Array<string>;
}

export interface productList {
  productId: string | product;
  options: Array<selectOption>;
  count: number;
  isRefund: boolean;
  isCancel: boolean;
  isDelete: boolean;
}

export interface refundItem {
  productId: string;
  count: number;
  options: options;
}
export interface refund {
  refundId: string;
  userId: string;
  orderId: string;
  type: string;
  status: boolean;
  dateCreated: string;
  reason: string;
  content: string;
  photoList: string[];
  detailList: Array<refundDetail>;
  isCancel: boolean;
}
export interface refundDetail {
  detailId: string;
  productId: string | product;
  count: number;
  options: Array<selectOption>;
  refundId: string;
  dateCreated: string;
}

export interface cancel {
  cancelId: string;
  userId: string;
  dateCreated: string;
  productId: string;
  count: number;
  options: selectOption;
  orderId: string;
}
export interface order {
  orderId: string;
  userId: string;
  address: address;
  dateCreated: string;
  price: number;
  totalPrice: number;
  isPaied: boolean;
  payId: string;
  detailList: Array<orderDetail>;
}

export interface orderDetail {
  detailId: string;
  productId: string | product;
  count: number;
  options: Array<selectOption>;
  reviewId: string;
  refundId: string;
  isDelete: boolean;
  isComplete: boolean;
  isDelivery: boolean;
  isCancel: boolean;
  orderId: string;
  userId: string;
  dateCreated: string;
}
export interface product {
  productId: string;
  title: string;
  content: string;
  category: string;
  subCategory: string;
  price: number;
  finalPrice: number;
  sellCnt: number;
  imageList: Array<string>;
  options: Array<options>;
  heartList: Array<string>;
  dateCreated: string;
  isOption: boolean;
  isDisplay: boolean;
  stockCnt: number;
  detailImage: string;
  likeSwitch?: boolean;
}

export class Product {
  private _product: product;

  constructor() {
    this._product = {
      productId: '',
      title: '',
      content: '',
      category: '',
      subCategory: '',
      price: 0,
      finalPrice: 0,
      sellCnt: 0,
      imageList: [],
      options: [{title: '', values: []}],
      heartList: [],
      dateCreated: '',
      isOption: false,
      isDisplay: true,
      stockCnt: 0,
      detailImage: '',
      likeSwitch: false,
    };
  }

  get product() {
    return this._product;
  }

  set product(product: product) {
    this._product = product;
  }
}

export class Order {
  private _order: order;

  constructor() {
    this._order = {
      orderId: '',
      userId: '',
      address: {
        name: '',
        address: '',
        addressNum: '',
        phone: '',
      },
      dateCreated: '',
      price: 0,
      totalPrice: 0,
      isPaied: false,
      payId: '',
      detailList: [],
    };
  }

  get order() {
    return this._order;
  }

  set order(order: order) {
    this._order = order;
  }
}

export class Refund {
  private _refund: refund;

  constructor() {
    this._refund = {
      refundId: '',
      userId: '',
      orderId: '',
      type: '',
      status: false,
      dateCreated: '',
      reason: '',
      content: '',
      photoList: [],
      detailList: [],
      isCancel: false,
    };
  }

  get refund() {
    return this._refund;
  }

  set refund(refund: refund) {
    this._refund = refund;
  }
}
export class RefundDetail {
  private _refundDetail: refundDetail;

  constructor() {
    this._refundDetail = {
      detailId: '',
      productId: '',
      refundId: '',
      count: 0,
      options: [],
      dateCreated: '',
    };
  }

  get refundDetail() {
    return this._refundDetail;
  }

  set refundDetail(refundDetail: refundDetail) {
    this._refundDetail = refundDetail;
  }
}
export class OrderDetail {
  private _orderDetail: orderDetail;

  constructor() {
    this._orderDetail = {
      detailId: '',
      productId: '',
      orderId: '',
      userId: '',
      count: 0,
      reviewId: '',
      refundId: '',
      isDelete: false,
      isComplete: false,
      isDelivery: false,
      isCancel: false,
      options: [],
      dateCreated: '',
    };
  }

  get orderDetail() {
    return this._orderDetail;
  }

  set orderDetail(orderDetail: orderDetail) {
    this._orderDetail = orderDetail;
  }
}
