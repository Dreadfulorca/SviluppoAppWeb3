import { Component, inject, OnInit } from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';
import { FeedService } from './feed.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly feedService = inject(FeedService);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly feedPosts = this.feedService.posts;
  protected readonly isFeedLoading = this.feedService.isLoading;
  protected readonly feedError = this.feedService.error;
  protected readonly isFeedEmpty = this.feedService.isEmpty;

  ngOnInit(): void {
    this.feedService.loadFeed();
  }

  protected reloadFeed(): void {
    this.feedService.loadFeed();
  }
}
