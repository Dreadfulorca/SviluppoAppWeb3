import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';

import { CreatePostForm } from '../home/create-post-form';

@Component({
  selector: 'app-create-post',
  imports: [CreatePostForm, MatButtonModule, RouterLink],
  templateUrl: './create-post.html',
  styleUrl: './create-post.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePost {
  private readonly router = inject(Router);

  protected async onPostCreated(): Promise<void> {
    await this.router.navigateByUrl('/home');
  }
}
