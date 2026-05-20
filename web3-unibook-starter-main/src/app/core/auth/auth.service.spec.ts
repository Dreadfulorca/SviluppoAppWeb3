import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { AuthResponse } from '../api/models/auth.types';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const storageKey = 'unibook.auth.session';

  const storedSession: AuthResponse = {
    token: 'stale-token',
    refreshToken: 'refresh-token-1',
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
  };

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(storageKey, JSON.stringify(storedSession));

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Router,
          useValue: {
            navigateByUrl: vi.fn().mockResolvedValue(true),
          },
        },
      ],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });

  it('coalesces concurrent refresh calls into a single network request', async () => {
    const service = TestBed.inject(AuthService);
    const httpMock = TestBed.inject(HttpTestingController);

    const firstRefresh = service.refreshSession();
    const secondRefresh = service.refreshSession();

    const requests = httpMock.match('/auth-refresh');
    expect(requests.length).toBe(1);
    expect(requests[0].request.method).toBe('POST');
    expect(requests[0].request.body).toEqual({ refreshToken: storedSession.refreshToken });

    requests[0].flush({
      token: 'fresh-token',
      refreshToken: 'refresh-token-2',
    });

    const [firstResult, secondResult] = await Promise.all([firstRefresh, secondRefresh]);

    expect(firstResult).toEqual(secondResult);
    expect(firstResult.token).toBe('fresh-token');
    expect(firstResult.refreshToken).toBe('refresh-token-2');
    expect(service.session()?.token).toBe('fresh-token');
    expect(service.session()?.refreshToken).toBe('refresh-token-2');

    const persistedSession = JSON.parse(localStorage.getItem(storageKey) ?? 'null') as AuthResponse;
    expect(persistedSession.token).toBe('fresh-token');
    expect(persistedSession.refreshToken).toBe('refresh-token-2');
  });
});