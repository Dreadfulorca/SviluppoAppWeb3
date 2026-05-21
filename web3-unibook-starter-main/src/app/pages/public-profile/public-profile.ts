import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Post } from '../../core/api/models/post.types';
import { sortPostsByNewest } from '../../core/api/models/post.utils';
import { UserPublic } from '../../core/api/models/user.types';
import { PostsApiService } from '../../core/api/posts-api.service';
import { UsersApiService } from '../../core/api/users-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { extractHttpErrorMessage } from '../../core/http/extract-http-error-message';
import { PostCard } from '../../shared/post-card/post-card';

@Component({
  selector: 'app-public-profile',
  imports: [MatButtonModule, PostCard],
  templateUrl: './public-profile.html',
  styleUrl: './public-profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicProfile implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly postsApi = inject(PostsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly usersApi = inject(UsersApiService);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly profile = signal<UserPublic | null>(null);
  protected readonly posts = signal<Post[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly actionPostId = signal<string | null>(null);
  protected readonly followLoading = signal(false);

  protected readonly isOwnProfile = computed(() => {
    const profile = this.profile();
    const currentUser = this.currentUser();

    return Boolean(profile && currentUser && profile.id === currentUser.id);
  });

  protected readonly postsEmpty = computed(
    () => !this.loading() && this.error() === null && this.posts().length === 0,
  );

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const userId = params.get('id');

      if (!userId) {
        this.error.set('Profilo utente non valido.');
        return;
      }

      void this.loadProfile(userId);
    });
  }

  protected async toggleFollow(): Promise<void> {
    const profile = this.profile();

    if (!profile || this.isOwnProfile() || this.followLoading()) {
      return;
    }

    try {
      this.followLoading.set(true);
      this.actionError.set(null);

      if (profile.isFollowing) {
        await firstValueFrom(this.usersApi.unfollow(profile.id));
      } else {
        await firstValueFrom(this.usersApi.follow(profile.id));
      }

      this.profile.update((currentProfile) =>
        currentProfile
          ? {
              ...currentProfile,
              isFollowing: !profile.isFollowing,
              followersCount: profile.isFollowing
                ? Math.max(0, profile.followersCount - 1)
                : profile.followersCount + 1,
            }
          : currentProfile,
      );

      this.updateCurrentUserFollowingCount(profile.isFollowing);
    } catch (error: unknown) {
      this.actionError.set(
        extractHttpErrorMessage(error, 'Impossibile aggiornare lo stato follow.'),
      );
    } finally {
      this.followLoading.set(false);
    }
  }

  protected async togglePostLike(post: Post): Promise<void> {
    if (this.actionPostId()) {
      return;
    }

    try {
      this.actionPostId.set(post.id);
      this.actionError.set(null);

      if (post.isLiked) {
        await firstValueFrom(this.postsApi.unlike(post.id));
      } else {
        await firstValueFrom(this.postsApi.like(post.id));
      }

      this.posts.update((posts) =>
        posts.map((currentPost) =>
          currentPost.id === post.id
            ? {
                ...currentPost,
                isLiked: !post.isLiked,
                likesCount: post.isLiked ? Math.max(0, post.likesCount - 1) : post.likesCount + 1,
              }
            : currentPost,
        ),
      );
    } catch (error: unknown) {
      this.actionError.set(extractHttpErrorMessage(error, 'Impossibile aggiornare il like.'));
    } finally {
      this.actionPostId.set(null);
    }
  }

  protected async removePost(postId: string): Promise<void> {
    if (this.actionPostId()) {
      return;
    }

    try {
      this.actionPostId.set(postId);
      this.actionError.set(null);
      await firstValueFrom(this.postsApi.remove(postId));
      this.posts.update((posts) => posts.filter((post) => post.id !== postId));
    } catch (error: unknown) {
      this.actionError.set(extractHttpErrorMessage(error, 'Impossibile eliminare il post.'));
    } finally {
      this.actionPostId.set(null);
    }
  }

  private async loadProfile(userId: string): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);
      this.actionError.set(null);
      this.profile.set(null);
      this.posts.set([]);

      const [profile, posts] = await Promise.all([
        firstValueFrom(this.usersApi.getById(userId)),
        firstValueFrom(this.usersApi.getPosts(userId)),
      ]);

      this.profile.set(profile);
      this.posts.set(sortPostsByNewest(posts));
    } catch (error: unknown) {
      this.error.set(extractHttpErrorMessage(error, 'Impossibile caricare il profilo.'));
    } finally {
      this.loading.set(false);
    }
  }

  private updateCurrentUserFollowingCount(wasFollowing: boolean): void {
    const currentUser = this.currentUser();

    if (!currentUser) {
      return;
    }

    this.authService.updateCurrentUser({
      ...currentUser,
      followingCount: wasFollowing
        ? Math.max(0, currentUser.followingCount - 1)
        : currentUser.followingCount + 1,
    });
  }
}
