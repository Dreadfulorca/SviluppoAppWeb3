import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Post } from '../../core/api/models/post.types';
import { sortPostsByNewest } from '../../core/api/models/post.utils';
import { PostsApiService } from '../../core/api/posts-api.service';
import { UsersApiService } from '../../core/api/users-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { extractHttpErrorMessage } from '../../core/http/extract-http-error-message';
import { PostCard } from '../../shared/post-card/post-card';
import { ProfileImageDialog } from '../../shared/profile-image-dialog/profile-image-dialog';

@Component({
  selector: 'app-profile',
  imports: [MatButtonModule, PostCard, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly postsApi = inject(PostsApiService);
  private readonly usersApi = inject(UsersApiService);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly posts = signal<Post[]>([]);
  protected readonly loadingPosts = signal(false);
  protected readonly postsError = signal<string | null>(null);
  protected readonly actionPostId = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);

  protected readonly postsEmpty = computed(
    () => !this.loadingPosts() && this.postsError() === null && this.posts().length === 0,
  );

  ngOnInit(): void {
    void this.loadPosts();
  }

  protected async reloadPosts(): Promise<void> {
    await this.loadPosts();
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

  protected openAvatar(imageUrl: string, firstName: string, lastName: string): void {
    this.dialog.open(ProfileImageDialog, {
      ariaLabel: 'Foto profilo a schermo intero',
      autoFocus: 'dialog',
      data: {
        alt: `Foto profilo di ${firstName} ${lastName}`,
        imageUrl,
      },
      height: '100dvh',
      maxWidth: '100vw',
      restoreFocus: true,
      width: '100vw',
    });
  }

  private async loadPosts(): Promise<void> {
    const user = this.currentUser();

    if (!user) {
      return;
    }

    try {
      this.loadingPosts.set(true);
      this.postsError.set(null);
      this.actionError.set(null);
      const posts = await firstValueFrom(this.usersApi.getPosts(user.id));
      this.posts.set(sortPostsByNewest(posts));
    } catch (error: unknown) {
      this.postsError.set(extractHttpErrorMessage(error, 'Impossibile caricare i tuoi post.'));
    } finally {
      this.loadingPosts.set(false);
    }
  }

}
