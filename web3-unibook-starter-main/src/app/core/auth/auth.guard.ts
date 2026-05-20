import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router, UrlTree } from '@angular/router';

import { AuthService } from './auth.service';

function redirectToLogin(redirectTo: string): UrlTree {
  const router = inject(Router);

  return router.createUrlTree(['/login'], {
    queryParams: { redirectTo },
  });
}

function redirectToHome(): UrlTree {
  return inject(Router).createUrlTree(['/home']);
}

function requireAuthenticatedUser(redirectTo: string): true | UrlTree {
  return inject(AuthService).isAuthenticated() ? true : redirectToLogin(redirectTo);
}

function requirePublicOnly(): true | UrlTree {
  return inject(AuthService).isAuthenticated() ? redirectToHome() : true;
}

export const authGuard: CanActivateFn = (_route, state) => {
  return requireAuthenticatedUser(state.url);
};

export const authChildGuard: CanActivateChildFn = (_route, state) => {
  return requireAuthenticatedUser(state.url);
};

export const publicOnlyGuard: CanActivateFn = () => {
  return requirePublicOnly();
};

export const publicOnlyChildGuard: CanActivateChildFn = () => {
  return requirePublicOnly();
};
