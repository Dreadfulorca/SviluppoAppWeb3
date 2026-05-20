import { UserSearchResult } from './user.types';

export interface Post {
  id: string;
  author: UserSearchResult;
  text: string;
  imageUrl: string | null;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
}

export interface CreatePostRequest {
  text: string;
  imageUrl?: string | null;
}
