import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Post } from './models/post.types';
import {
  UpdateProfileRequest,
  UserPrivate,
  UserPublic,
  UserSearchResult,
} from './models/user.types';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);

  getMe(): Observable<UserPrivate> {
    return this.http.get<UserPrivate>('/users-me');
  }

  updateMe(payload: UpdateProfileRequest): Observable<UserPrivate> {
    return this.http.put<UserPrivate>('/users-me', payload);
  }

  search(query: string): Observable<UserSearchResult[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<UserSearchResult[]>('/users-search', { params });
  }

  getById(userId: string): Observable<UserPublic> {
    return this.http.get<UserPublic>(`/users-by-id/${userId}`);
  }

  getPosts(userId: string): Observable<Post[]> {
    return this.http.get<Post[]>(`/users-posts/${userId}`);
  }

  follow(userId: string): Observable<void> {
    return this.http.post<void>(`/users-follow/${userId}`, null);
  }

  unfollow(userId: string): Observable<void> {
    return this.http.delete<void>(`/users-follow/${userId}`);
  }
}
