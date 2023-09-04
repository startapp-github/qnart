/** @format */

import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AuthGuard2 } from './guards/auth2.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./tabs/tabs.module').then((m) => m.TabsPageModule),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/account/login/login.module').then(
        (m) => m.LoginPageModule
      ),
    canActivate: [AuthGuard2],
  },
  {
    path: 'sign-up',
    loadChildren: () =>
      import('./pages/account/sign-up/sign-up.module').then(
        (m) => m.SignUpPageModule
      ),
  },
  {
    path: 'find-password',
    loadChildren: () =>
      import('./pages/account/find-password/find-password.module').then(
        (m) => m.FindPasswordPageModule
      ),
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./pages/home/home.module').then((m) => m.HomePageModule),
    // canActivate: [AuthGuard],
  },
  {
    path: 'search',
    loadChildren: () =>
      import('./pages/search/search.module').then((m) => m.SearchPageModule),
  },
  {
    path: 'image-modal',
    loadChildren: () =>
      import('./pages/image-modal/image-modal.module').then(
        (m) => m.ImageModalPageModule
      ),
  },
  {
    path: 'feed-detail',
    loadChildren: () =>
      import('./pages/feed-detail/feed-detail.module').then(
        (m) => m.FeedDetailPageModule
      ),
  },
  {
    path: 'feed-write',
    loadChildren: () =>
      import('./pages/feed-write/feed-write.module').then(
        (m) => m.FeedWritePageModule
      ),
  },
  {
    path: 'feed-reply',
    loadChildren: () =>
      import('./pages/feed-reply/feed-reply.module').then(
        (m) => m.FeedReplyPageModule
      ),
  },
  {
    path: 'feed-report',
    loadChildren: () =>
      import('./pages/feed-report/feed-report.module').then(
        (m) => m.FeedReportPageModule
      ),
  },
  {
    path: 'chatting',
    loadChildren: () =>
      import('./pages/chatting/chatting.module').then(
        (m) => m.ChattingPageModule
      ),
  },
  {
    path: 'chatting-detail',
    loadChildren: () =>
      import('./pages/chatting-detail/chatting-detail.module').then(
        (m) => m.ChattingDetailPageModule
      ),
  },
  {
    path: 'push',
    loadChildren: () =>
      import('./pages/push/push.module').then((m) => m.PushPageModule),
  },
  {
    path: 'mypage',
    loadChildren: () =>
      import('./pages/mypage/mypage.module').then((m) => m.MypagePageModule),
  },
  {
    path: 'setting',
    loadChildren: () =>
      import('./pages/setting/setting.module').then((m) => m.SettingPageModule),
  },
  {
    path: 'inquiry',
    loadChildren: () =>
      import('./pages/inquiry/inquiry.module').then((m) => m.InquiryPageModule),
  },
  {
    path: 'inquiry-write',
    loadChildren: () =>
      import('./pages/inquiry-write/inquiry-write.module').then(
        (m) => m.InquiryWritePageModule
      ),
  },
  {
    path: 'inquiry-detail',
    loadChildren: () =>
      import('./pages/inquiry-detail/inquiry-detail.module').then(
        (m) => m.InquiryDetailPageModule
      ),
  },
  {
    path: 'notice',
    loadChildren: () =>
      import('./pages/notice/notice.module').then((m) => m.NoticePageModule),
  },
  {
    path: 'change-password',
    loadChildren: () =>
      import('./pages/change-password/change-password.module').then(
        (m) => m.ChangePasswordPageModule
      ),
  },
  {
    path: 'personal-info',
    loadChildren: () =>
      import('./pages/terms/personal-info/personal-info.module').then(
        (m) => m.PersonalInfoPageModule
      ),
  },
  {
    path: 'service',
    loadChildren: () =>
      import('./pages/terms/service/service.module').then(
        (m) => m.ServicePageModule
      ),
  },
  {
    path: 'black-list',
    loadChildren: () =>
      import('./pages/black-list/black-list.module').then(
        (m) => m.BlackListPageModule
      ),
  },
  {
    path: 'my-write',
    loadChildren: () =>
      import('./pages/my-write/my-write.module').then(
        (m) => m.MyWritePageModule
      ),
  },
  {
    path: 'my-like',
    loadChildren: () =>
      import('./pages/my-like/my-like.module').then((m) => m.MyLikePageModule),
  },
  {
    path: 'my-subject',
    loadChildren: () =>
      import('./pages/my-subject/my-subject.module').then(
        (m) => m.MySubjectPageModule
      ),
  },
  {
    path: 'comment-correct',
    loadChildren: () =>
      import('./pages/comment-correct/comment-correct.module').then(
        (m) => m.CommentCorrectPageModule
      ),
  },
  {
    path: 'profile-set',
    loadChildren: () =>
      import('./pages/profile-set/profile-set.module').then(
        (m) => m.ProfileSetPageModule
      ),
  },
  {
    path: 'common-question',
    loadChildren: () =>
      import('./pages/common-question/common-question.module').then(
        (m) => m.CommonQuestionPageModule
      ),
  },
  {
    path: 'notice-detail',
    loadChildren: () =>
      import('./pages/notice-detail/notice-detail.module').then(
        (m) => m.NoticeDetailPageModule
      ),
  },
  {
    path: 'expired-service',
    loadChildren: () =>
      import('./pages/expired-service/expired-service.module').then(
        (m) => m.ExpiredServicePageModule
      ),
  },
  {
    path: 'shop',
    loadChildren: () =>
      import('./pages/shop/shop.module').then((m) => m.ShopModule),
  },
  // {
  //   path: 'shop/category',
  //   loadChildren: () =>
  //     import('./pages/shop/category/category.module').then(
  //       (m) => m.CategoryPageModule
  //     ),
  // },
  // {
  //   path: 'shop/basket',
  //   loadChildren: () =>
  //     import('./pages/shop/basket/basket.module').then(
  //       (m) => m.BasketPageModule
  //     ),
  // },
  // {
  //   path: 'shop/recommend',
  //   loadChildren: () =>
  //     import('./pages/shop/recommend/recommend.module').then(
  //       (m) => m.RecommendPageModule
  //     ),
  // },
  // {
  //   path: 'shop/search',
  //   loadChildren: () =>
  //     import('./pages/shop/search/search.module').then(
  //       (m) => m.SearchPageModule
  //     ),
  // },
  // {
  //   path: 'shop/review',
  //   loadChildren: () =>
  //     import('./pages/shop/review/review.module').then(
  //       (m) => m.ReviewPageModule
  //     ),
  // },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
