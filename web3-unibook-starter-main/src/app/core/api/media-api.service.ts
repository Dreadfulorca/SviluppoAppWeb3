import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MediaUploadRequest, MediaUploadResponse } from './models/media.types';

@Injectable({ providedIn: 'root' })
export class MediaApiService {
  private readonly http = inject(HttpClient);

  upload(payload: MediaUploadRequest): Observable<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('kind', payload.kind);
    formData.append('file', payload.file, payload.file.name || 'upload.img');

    return this.http.post<MediaUploadResponse>('/media-upload', formData);
  }

  uploadAvatar(file: File): Observable<MediaUploadResponse> {
    return this.upload({ kind: 'avatar', file });
  }

  uploadPostImage(file: File): Observable<MediaUploadResponse> {
    return this.upload({ kind: 'post', file });
  }
}
