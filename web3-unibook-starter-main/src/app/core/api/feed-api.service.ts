import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Post } from './models/post.types';

@Injectable({ providedIn: 'root' })
export class FeedApiService {
  private readonly http = inject(HttpClient);

  getFeed(): Observable<Post[]> {
    return this.http.get<Post[]>('/feed');
  }
}
