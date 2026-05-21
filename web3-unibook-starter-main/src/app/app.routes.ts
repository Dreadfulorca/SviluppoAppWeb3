import { Routes } from '@angular/router';

import { authChildGuard, publicOnlyChildGuard } from './core/auth/auth.guard';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { ProtectedLayout } from './layouts/protected-layout/protected-layout';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: '',
    component: AuthLayout,
    canActivateChild: [publicOnlyChildGuard],
    children: [
      {
        path: 'login',
        component: Login,
      },
      {
        path: 'register',
        component: Register,
      },
    ],
  },
  {
    path: '',
    component: ProtectedLayout,
    canActivateChild: [authChildGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
      {
        path: 'posts/new',
        loadComponent: () => import('./pages/create-post/create-post').then((m) => m.CreatePost),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'profile/edit',
        loadComponent: () => import('./pages/profile-edit/profile-edit').then((m) => m.ProfileEdit),
      },
      {
        path: 'users/search',
        loadComponent: () => import('./pages/user-search/user-search').then((m) => m.UserSearch),
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./pages/public-profile/public-profile').then((m) => m.PublicProfile),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
