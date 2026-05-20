export interface UserPrivate {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  avatarUrl: string | null;
  bio: string | null;
  followersCount: number;
  followingCount: number;
}

export interface UserPublic {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  bio: string | null;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export interface UserSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface UpdateProfileRequest {
  avatarUrl?: string | null;
  bio?: string | null;
}
