import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CreatePostRequest, Post } from './models/post.types';

@Injectable({ providedIn: 'root' })
export class PostsApiService {
  private readonly http = inject(HttpClient);

  create(payload: CreatePostRequest): Observable<Post> {
    return this.http.post<Post>('/posts', payload);
  }

  remove(postId: string): Observable<void> {
    return this.http.delete<void>(`/posts/${postId}`);
  }

  like(postId: string): Observable<void> {
    return this.http.post<void>(`/posts-like/${postId}`, null);
  }

  unlike(postId: string): Observable<void> {
    return this.http.delete<void>(`/posts-like/${postId}`);
  }
}
