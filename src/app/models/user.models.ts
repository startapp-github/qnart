/** @format */

export interface User {
  id?: string;
  uid: string;
  email: string;
  loginType: string;
  dateCreated: string;
  activeSwitch: boolean;
  exitSwitch: boolean;
  nickName: string;
  profileImage: string;
  marketingAgreement: boolean;
  privacyAreement: boolean;
  serviceAreement: boolean;
  pushSwitch: boolean;
  pushId: string | string[] | null;
  users?: Array<string>;
  likedPosts?: LikedPosts[];
  intestedCategory?: string[];
  blockedUsers?: string[];

  // 커뮤니티와 쇼핑몰 서로 겹치는 user db를 제외한 쇼핑몰 user 정보에 있던 필드들
  // name?: string;
  recipient?: string;
  address?: string;
  addressDetail?: string;
  deliveryPhone?: string;
  recentKeyword?: Array<any>;
  cartCount?: number;
  // phone?: string;
  postCode?: string;
}

export interface shopUser {
  // uid: string;
  // dateCreated: string;
  // exitSwitch: boolean;
  // email: string;
  name: string;
  marketingSwitch: boolean;
  recipient: string;
  address: string;
  deliveryPhone: string;
  recentKeyword: Array<any>;
  cartCount: number;
  // pushSwitch: boolean;
  // pushId: Array<string>;
  phone: string;
  postCode: string;
}

export interface LikedPosts {
  dateLiked: string;
  postId: string;
}
