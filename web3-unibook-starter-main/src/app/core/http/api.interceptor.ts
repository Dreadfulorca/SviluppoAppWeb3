import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../auth/auth.service';
import { appApiConfig } from '../config/app-api.config';

export const apiInterceptor: HttpInterceptorFn = (request, next) => {
  if (/^https?:\/\//.test(request.url)) {
    return next(request);
  }

  const authService = inject(AuthService);
  let headers = request.headers.set('apikey', appApiConfig.apikey);
  const token = authService.token();
  const isAuthRequest = /^\/auth-(login|register|refresh)$/.test(request.url);

  if (token && !isAuthRequest) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  return next(
    request.clone({
      url: `${appApiConfig.functionsBaseUrl}${request.url}`,
      headers,
    }),
  );
};
