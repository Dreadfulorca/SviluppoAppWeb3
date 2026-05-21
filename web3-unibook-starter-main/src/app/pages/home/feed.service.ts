import { computed, inject, Injectable, signal } from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { FeedApiService } from '../../core/api/feed-api.service';
import { Post } from '../../core/api/models/post.types';
import { sortPostsByNewest } from '../../core/api/models/post.utils';
import { PostsApiService } from '../../core/api/posts-api.service';
import { extractHttpErrorMessage } from '../../core/http/extract-http-error-message';

@Injectable({ providedIn: 'root' })
export class FeedService {
  private readonly feedApiService = inject(FeedApiService);
  private readonly postsApiService = inject(PostsApiService);
  private readonly postsState = signal<Post[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly actionPostIdState = signal<string | null>(null);
  private readonly actionErrorState = signal<string | null>(null);

  readonly posts = this.postsState.asReadonly();
  readonly isLoading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly actionPostId = this.actionPostIdState.asReadonly();
  readonly actionError = this.actionErrorState.asReadonly();
  readonly isEmpty = computed(
    () => !this.isLoading() && this.error() === null && this.posts().length === 0,
  );

  loadFeed(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.feedApiService
      .getFeed()
      .pipe(
        catchError((error: unknown) => {
          this.errorState.set(extractHttpErrorMessage(error, 'Impossibile caricare il feed.'));
          return EMPTY;
        }),
        finalize(() => {
          this.loadingState.set(false);
        }),
      )
      .subscribe((posts) => {
        this.postsState.set(sortPostsByNewest(posts));
      });
  }

  addPost(post: Post): void {
    this.postsState.update((posts) => [post, ...posts]);
  }

  toggleLike(post: Post): void {
    if (this.actionPostId()) {
      return;
    }

    this.actionPostIdState.set(post.id);
    this.actionErrorState.set(null);

    const request$ = post.isLiked
      ? this.postsApiService.unlike(post.id)
      : this.postsApiService.like(post.id);

    request$
      .pipe(
        catchError((error: unknown) => {
          this.actionErrorState.set(
            extractHttpErrorMessage(error, 'Impossibile aggiornare il like.'),
          );
          return EMPTY;
        }),
        finalize(() => {
          this.actionPostIdState.set(null);
        }),
      )
      .subscribe(() => {
        this.postsState.update((posts) =>
          posts.map((currentPost) =>
            currentPost.id === post.id
              ? {
                  ...currentPost,
                  isLiked: !post.isLiked,
                  likesCount: post.isLiked
                    ? Math.max(0, post.likesCount - 1)
                    : post.likesCount + 1,
                }
              : currentPost,
          ),
        );
      });
  }

  removePost(postId: string): void {
    if (this.actionPostId()) {
      return;
    }

    this.actionPostIdState.set(postId);
    this.actionErrorState.set(null);

    this.postsApiService
      .remove(postId)
      .pipe(
        catchError((error: unknown) => {
          this.actionErrorState.set(
            extractHttpErrorMessage(error, 'Impossibile eliminare il post.'),
          );
          return EMPTY;
        }),
        finalize(() => {
          this.actionPostIdState.set(null);
        }),
      )
      .subscribe(() => {
        this.postsState.update((posts) => posts.filter((post) => post.id !== postId));
      });
  }
}
