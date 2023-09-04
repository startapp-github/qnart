/** @format */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { AuthGuard } from 'src/app/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'basket',
        loadChildren: () =>
          import('../shop/basket/basket.module').then(
            (m) => m.BasketPageModule
          ),
        // canActivate: [AuthGuard],
      },
      {
        path: 'category',
        loadChildren: () =>
          import('../shop/category/category.module').then(
            (m) => m.CategoryPageModule
          ),
      },
      {
        path: 'event-list',
        loadChildren: () =>
          import('../shop/event-list/event-list.module').then(
            (m) => m.EventListPageModule
          ),
      },
      {
        path: 'event-detail',
        loadChildren: () =>
          import('../shop/event-detail/event-detail.module').then(
            (m) => m.EventDetailPageModule
          ),
      },
      {
        path: 'recommend',
        loadChildren: () =>
          import('../shop/recommend/recommend.module').then(
            (m) => m.RecommendPageModule
          ),
      },
      {
        path: 'search',
        loadChildren: () =>
          import('../shop/search/search.module').then(
            (m) => m.SearchPageModule
          ),
      },
      {
        path: 'review',
        loadChildren: () =>
          import('../shop/review/review.module').then(
            (m) => m.ReviewPageModule
          ),
      },
      {
        path: 'review-write',
        loadChildren: () =>
          import('../shop/review-write/review-write.module').then(
            (m) => m.ReviewWritePageModule
          ),
      },
      {
        path: 'like',
        loadChildren: () =>
          import('../shop/like/like.module').then((m) => m.LikePageModule),
      },
      {
        path: 'popular',
        loadChildren: () =>
          import('../shop/popular/popular.module').then(
            (m) => m.PopularPageModule
          ),
      },
      {
        path: 'order',
        loadChildren: () =>
          import('../shop/order/order.module').then((m) => m.OrderPageModule),
      },
      {
        path: 'order-list',
        loadChildren: () =>
          import('../shop/order-list/order-list.module').then(
            (m) => m.OrderListPageModule
          ),
      },
      {
        path: 'order-list-detail',
        loadChildren: () =>
          import('../shop/order-list-detail/order-list-detail.module').then(
            (m) => m.OrderListDetailPageModule
          ),
      },
      {
        path: 'order-cancel',
        loadChildren: () =>
          import('../shop/order-cancel/order-cancel.module').then(
            (m) => m.OrderCancelPageModule
          ),
      },
      {
        path: 'redund-detail-cart',
        loadChildren: () =>
          import('../shop/redund-detail-cart/redund-detail-cart.module').then(
            (m) => m.RedundDetailCartPageModule
          ),
      },
      {
        path: 'refund-detail',
        loadChildren: () =>
          import('../shop/refund-detail/refund-detail.module').then(
            (m) => m.RefundDetailPageModule
          ),
      },
      {
        path: 'refund-list',
        loadChildren: () =>
          import('../shop/refund-list/refund-list.module').then(
            (m) => m.RefundListPageModule
          ),
      },
      {
        path: 'refund-method',
        loadChildren: () =>
          import('../shop/refund-method/refund-method.module').then(
            (m) => m.RefundMethodPageModule
          ),
      },
      {
        path: 'refund-product',
        loadChildren: () =>
          import('../shop/refund-product/refund-product.module').then(
            (m) => m.RefundProductPageModule
          ),
      },
      {
        path: 'refund-reason',
        loadChildren: () =>
          import('../shop/refund-reason/refund-reason.module').then(
            (m) => m.RefundReasonPageModule
          ),
      },
      {
        path: 'refund-reason-complete',
        loadChildren: () =>
          import(
            '../shop/refund-reason-complete/refund-reason-complete.module'
          ).then((m) => m.RefundReasonCompletePageModule),
      },
      {
        path: 'myinfo-address',
        loadChildren: () =>
          import('../shop/myinfo-address/myinfo-address.module').then(
            (m) => m.MyinfoAddressPageModule
          ),
      },
      {
        path: 'product-list',
        loadChildren: () =>
          import('../shop/product-list/product-list.module').then(
            (m) => m.ProductListPageModule
          ),
      },
      {
        path: 'product-detail',
        loadChildren: () =>
          import('../shop/product-detail/product-detail.module').then(
            (m) => m.ProductDetailPageModule
          ),
      },
      {
        path: 'product-detail-popup',
        loadChildren: () =>
          import(
            '../shop/product-detail-popup/product-detail-popup.module'
          ).then((m) => m.ProductDetailPopupPageModule),
      },
      {
        path: 'product-inquiry',
        loadChildren: () =>
          import('../shop/product-inquiry/product-inquiry.module').then(
            (m) => m.ProductInquiryPageModule
          ),
      },
      {
        path: 'pay-complete',
        loadChildren: () =>
          import('../shop/pay-complete/pay-complete.module').then(
            (m) => m.PayCompletePageModule
          ),
      },
      {
        path: 'tracking-modal',
        loadChildren: () =>
          import('../shop/tracking-modal/tracking-modal.module').then(
            (m) => m.TrackingModalPageModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShopPageRoutingModule {}
