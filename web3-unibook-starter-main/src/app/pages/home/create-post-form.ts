import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormField, FormRoot, form, maxLength, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { firstValueFrom } from 'rxjs';

import { MediaApiService } from '../../core/api/media-api.service';
import { Post } from '../../core/api/models/post.types';
import { PostsApiService } from '../../core/api/posts-api.service';
import { extractHttpErrorMessage } from '../../core/http/extract-http-error-message';

interface CreatePostFormModel {
  text: string;
}

const MAX_POST_LENGTH = 500;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

@Component({
  selector: 'app-create-post-form',
  imports: [FormField, FormRoot, MatButtonModule, MatIconModule, MatInputModule],
  templateUrl: './create-post-form.html',
  styleUrl: './create-post-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePostForm {
  private readonly mediaApi = inject(MediaApiService);
  private readonly postsApi = inject(PostsApiService);
  private readonly imageInput = viewChild<ElementRef<HTMLInputElement>>('postImage');

  readonly postCreated = output<Post>();

  protected readonly model = signal<CreatePostFormModel>({
    text: '',
  });

  protected readonly selectedImage = signal<File | null>(null);
  protected readonly fileError = signal<string | null>(null);
  protected readonly uploading = signal(false);

  protected readonly form = form(
    this.model,
    (post) => {
      required(post.text, { message: 'Inserisci il testo del post.' });
      maxLength(post.text, MAX_POST_LENGTH, {
        message: `Il testo non può superare ${MAX_POST_LENGTH} caratteri.`,
      });
    },
    {
      submission: {
        action: async () => {
          if (this.fileError()) {
            return {
              kind: 'serverError',
              message: this.fileError() ?? 'Seleziona un file valido.',
            };
          }

          try {
            let imageUrl: string | null = null;
            const file = this.selectedImage();

            if (file) {
              this.uploading.set(true);
              const uploadedImage = await firstValueFrom(this.mediaApi.uploadPostImage(file));
              imageUrl = uploadedImage.url;
            }

            const createdPost = await firstValueFrom(
              this.postsApi.create({
                text: this.model().text.trim(),
                imageUrl,
              }),
            );

            this.postCreated.emit(createdPost);
            this.resetForm();
            return;
          } catch (error: unknown) {
            return {
              kind: 'serverError',
              message: extractHttpErrorMessage(error, 'Creazione del post non riuscita.'),
            };
          } finally {
            this.uploading.set(false);
          }
        },
        onInvalid: (field) => {
          field().errorSummary()[0]?.fieldTree().focusBoundControl();
        },
      },
    },
  );

  protected onImageSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0] ?? null;

    if (!file) {
      this.selectedImage.set(null);
      this.fileError.set(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.rejectFile(inputElement, 'Seleziona un file immagine valido.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      this.rejectFile(inputElement, 'Seleziona un file immagine fino a 5 MB.');
      return;
    }

    this.selectedImage.set(file);
    this.fileError.set(null);
  }

  private rejectFile(inputElement: HTMLInputElement, message: string): void {
    this.selectedImage.set(null);
    this.fileError.set(message);
    inputElement.value = '';
  }

  private resetForm(): void {
    this.model.set({ text: '' });
    this.selectedImage.set(null);
    this.fileError.set(null);
    const inputElement = this.imageInput()?.nativeElement;

    if (inputElement) {
      inputElement.value = '';
    }
  }
}
