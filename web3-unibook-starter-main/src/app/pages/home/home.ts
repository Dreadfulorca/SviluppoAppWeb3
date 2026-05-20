import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';

import { Post } from '../../core/api/models/post.types';
import { AuthService } from '../../core/auth/auth.service';
import { PostCard } from '../../shared/post-card/post-card';
import { CreatePostForm } from './create-post-form';
import { FeedService } from './feed.service';

@Component({
  selector: 'app-home',
  imports: [CreatePostForm, PostCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly feedService = inject(FeedService);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly feedPosts = this.feedService.posts;
  protected readonly isFeedLoading = this.feedService.isLoading;
  protected readonly feedError = this.feedService.error;
  protected readonly isFeedEmpty = this.feedService.isEmpty;
  protected readonly actionPostId = this.feedService.actionPostId;
  protected readonly actionError = this.feedService.actionError;

  ngOnInit(): void {
    this.feedService.loadFeed();
  }

  protected reloadFeed(): void {
    this.feedService.loadFeed();
  }

  protected onPostCreated(post: Post): void {
    this.feedService.addPost(post);
  }

  protected togglePostLike(post: Post): void {
    this.feedService.toggleLike(post);
  }

  protected removePost(postId: string): void {
    this.feedService.removePost(postId);
  }
}
