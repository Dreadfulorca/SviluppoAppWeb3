import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { Post } from '../../core/api/models/post.types';

@Component({
  selector: 'app-post-card',
  imports: [DatePipe, MatButtonModule, MatCardModule, MatIconModule, RouterLink],
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
  protected readonly authorProfileLink = computed(() =>
    this.canRemove() ? ['/profile'] : ['/users', this.post().author.id],
  );

  protected toggleLike(): void {
    this.likeToggled.emit(this.post());
  }

  protected removePost(): void {
    const confirmed = window.confirm('Vuoi eliminare definitivamente questo post?');

    if (!confirmed) {
      return;
    }

    this.postRemoved.emit(this.post().id);
  }
}
