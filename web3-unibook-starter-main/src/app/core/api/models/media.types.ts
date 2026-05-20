export type MediaKind = 'avatar' | 'post';

export interface MediaUploadRequest {
  kind: MediaKind;
  file: File;
}

export interface MediaUploadResponse {
  url: string;
}
