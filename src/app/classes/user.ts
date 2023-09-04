export interface Address {
  name: string;
  address: string;
  detail: string;
  phone: string;
  addrNum: string;
}

export interface user {
  uid: string;
  userNum: number;
  email: string;
  nickname: string;
  phone: string;
  exitSwitch: boolean;
  marketing: boolean;
  dateCreated: string;
  pushId: string;
  wishList: string[];
  cartList: string[];
  address: Address;
}

export class User {
  private _user: user;

  constructor() {
    this._user = {
      uid: '',
      userNum: 0,
      email: '',
      nickname: '',
      phone: '',
      exitSwitch: false,
      marketing: false,
      dateCreated: '',
      pushId: '',
      wishList: [],
      cartList: [],
      address: {
        name: '',
        address: '',
        detail: '',
        phone: '',
        addrNum: '',
      },
    };
  }

  get user() {
    return this._user;
  }

  set usuer(user: user) {
    this._user = user;
  }
}
