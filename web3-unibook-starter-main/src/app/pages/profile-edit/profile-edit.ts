import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormField, FormRoot, form, maxLength } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { MediaApiService } from '../../core/api/media-api.service';
import { UsersApiService } from '../../core/api/users-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { extractHttpErrorMessage } from '../../core/http/extract-http-error-message';

interface ProfileEditFormModel {
  bio: string;
}

const MAX_BIO_LENGTH = 300;
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

@Component({
  selector: 'app-profile-edit',
  imports: [FormField, FormRoot, MatButtonModule, MatInputModule, RouterLink],
  templateUrl: './profile-edit.html',
  styleUrl: './profile-edit.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileEdit {
  private readonly authService = inject(AuthService);
  private readonly mediaApi = inject(MediaApiService);
  private readonly router = inject(Router);
  private readonly usersApi = inject(UsersApiService);
  private readonly avatarInput = viewChild<ElementRef<HTMLInputElement>>('avatarInput');

  protected readonly currentUser = this.authService.currentUser;
  protected readonly selectedAvatar = signal<File | null>(null);
  protected readonly fileError = signal<string | null>(null);
  protected readonly uploading = signal(false);
  protected readonly savedMessage = signal<string | null>(null);

  protected readonly model = signal<ProfileEditFormModel>({
    bio: this.currentUser()?.bio ?? '',
  });

  protected readonly avatarPreviewUrl = computed(() => {
    const selectedAvatar = this.selectedAvatar();

    if (selectedAvatar) {
      return null;
    }

    return this.currentUser()?.avatarUrl ?? null;
  });

  protected readonly form = form(
    this.model,
    (profile) => {
      maxLength(profile.bio, MAX_BIO_LENGTH, {
        message: `La bio non può superare ${MAX_BIO_LENGTH} caratteri.`,
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
            this.savedMessage.set(null);
            let avatarUrl = this.currentUser()?.avatarUrl ?? null;
            const avatarFile = this.selectedAvatar();

            if (avatarFile) {
              this.uploading.set(true);
              const uploadedAvatar = await firstValueFrom(this.mediaApi.uploadAvatar(avatarFile));
              avatarUrl = uploadedAvatar.url;
            }

            const updatedUser = await firstValueFrom(
              this.usersApi.updateMe({
                bio: this.model().bio.trim() || null,
                avatarUrl,
              }),
            );

            this.authService.updateCurrentUser(updatedUser);
            this.resetAvatarInput();
            this.savedMessage.set('Profilo aggiornato correttamente.');
            await this.router.navigateByUrl('/profile');
            return;
          } catch (error: unknown) {
            return {
              kind: 'serverError',
              message: extractHttpErrorMessage(error, 'Aggiornamento profilo non riuscito.'),
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

  protected onAvatarSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0] ?? null;

    if (!file) {
      this.selectedAvatar.set(null);
      this.fileError.set(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.rejectFile(inputElement, 'Seleziona un file immagine valido.');
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      this.rejectFile(inputElement, 'Seleziona un file immagine fino a 5 MB.');
      return;
    }

    this.selectedAvatar.set(file);
    this.fileError.set(null);
  }

  private rejectFile(inputElement: HTMLInputElement, message: string): void {
    this.selectedAvatar.set(null);
    this.fileError.set(message);
    inputElement.value = '';
  }

  private resetAvatarInput(): void {
    this.selectedAvatar.set(null);
    this.fileError.set(null);
    const inputElement = this.avatarInput()?.nativeElement;

    if (inputElement) {
      inputElement.value = '';
    }
  }
}
