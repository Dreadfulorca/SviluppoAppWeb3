import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';

import { AuthService } from '../auth/auth.service';
import { authRefreshInterceptor } from './auth-refresh.interceptor';

describe('authRefreshInterceptor', () => {
  it('retries a protected request once after refreshing the session', async () => {
    const refreshSession = vi.fn().mockResolvedValue({
      token: 'fresh-token',
      refreshToken: 'refresh-token-2',
      user: {
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        birthDate: '1999-05-15',
        avatarUrl: null,
        bio: null,
        followersCount: 0,
        followingCount: 0,
      },
    });

    const clearSession = vi.fn();
    const navigateByUrl = vi.fn().mockResolvedValue(true);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authRefreshInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            refreshSession,
            clearSession,
            isAuthenticated: () => true,
          },
        },
        {
          provide: Router,
          useValue: {
            navigateByUrl,
          },
        },
      ],
    });

    const http = TestBed.inject(HttpClient);
    const httpMock = TestBed.inject(HttpTestingController);

    const responsePromise = firstValueFrom(http.get('/users-me'));

    const originalRequest = httpMock.expectOne('/users-me');
    originalRequest.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    await Promise.resolve();
    await Promise.resolve();

    const retriedRequest = httpMock.expectOne('/users-me');
    expect(retriedRequest.request.headers.get('Authorization')).toBe('Bearer fresh-token');

    retriedRequest.flush({ id: 'user-1' });

    await expect(responsePromise).resolves.toEqual({ id: 'user-1' });

    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(clearSession).not.toHaveBeenCalled();
    expect(navigateByUrl).not.toHaveBeenCalled();

    httpMock.verify();
  });
});
