import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { Post } from '../../core/api/models/post.types';

@Component({
  selector: 'app-post-card',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostCard {
  readonly post = input.required<Post>();
  readonly currentUserId = input<string | null>(null);
  readonly busy = input(false);

  readonly likeToggled = output<Post>();
  readonly postRemoved = output<string>();

  protected readonly authorName = computed(
    () => `${this.post().author.firstName} ${this.post().author.lastName}`,
  );
  protected readonly canRemove = computed(() => this.currentUserId() === this.post().author.id);

  protected toggleLike(): void {
    this.likeToggled.emit(this.post());
  }

  protected removePost(): void {
    this.postRemoved.emit(this.post().id);
  }
}
