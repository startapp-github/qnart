/** @format */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('../pages/home/home.module').then((m) => m.HomePageModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'chatting',
        loadChildren: () =>
          import('../pages/chatting/chatting.module').then(
            (m) => m.ChattingPageModule
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'push',
        loadChildren: () =>
          import('../pages/push/push.module').then((m) => m.PushPageModule),
        canActivate: [AuthGuard],
      },
      {
        path: 'mall',
        loadChildren: () =>
          import('../pages/shop/home/home.module').then(
            (m) => m.HomePageModule
          ),
      },
      {
        path: 'mypage',
        loadChildren: () =>
          import('../pages/mypage/mypage.module').then(
            (m) => m.MypagePageModule
          ),
        canActivate: [AuthGuard],
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
