import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';

const retriedAfterRefresh = new HttpContextToken<boolean>(() => false);

function navigateToLogin(router: Router) {
  return router.navigateByUrl('/login').catch(() => false);
}

export const authRefreshInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: unknown) => {
      const isAuthRequest = /\/auth-(login|register|refresh|logout)$/.test(request.url);
      const alreadyRetried = request.context.get(retriedAfterRefresh);

      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        isAuthRequest ||
        !authService.isAuthenticated() ||
        alreadyRetried
      ) {
        return throwError(() => error);
      }

      return from(authService.refreshSession()).pipe(
        switchMap((session) =>
          next(
            request.clone({
              headers: request.headers.set('Authorization', `Bearer ${session.token}`),
              context: request.context.set(retriedAfterRefresh, true),
            }),
          ).pipe(
            catchError((retryError: unknown) => {
              if (retryError instanceof HttpErrorResponse && retryError.status === 401) {
                authService.clearSession();
                return from(navigateToLogin(router)).pipe(
                  switchMap(() => throwError(() => retryError)),
                );
              }

              return throwError(() => retryError);
            }),
          ),
        ),
        catchError((refreshError: unknown) => {
          authService.clearSession();
          return from(navigateToLogin(router)).pipe(
            switchMap(() => throwError(() => refreshError)),
          );
        }),
      );
    }),
  );
};
