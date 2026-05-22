import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ProfileImageDialogData {
  alt: string;
  imageUrl: string;
}

@Component({
  selector: 'app-profile-image-dialog',
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <section class="image-viewer">
      <button
        mat-icon-button
        type="button"
        class="close-button"
        aria-label="Chiudi foto profilo"
        (click)="close()"
      >
        <mat-icon aria-hidden="true">close</mat-icon>
      </button>

      <img [src]="data.imageUrl" [alt]="data.alt" />
    </section>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .image-viewer {
      position: fixed;
      inset: 0;
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: clamp(1rem, 4vw, 3rem);
      background: rgba(15, 23, 42, 0.96);
    }

    img {
      display: block;
      max-width: min(100%, calc(100vw - 4rem));
      max-height: calc(100dvh - 4rem);
      border-radius: 1rem;
      object-fit: contain;
      box-shadow: 0 24px 72px rgba(0, 0, 0, 0.38);
      transform: translateY(-1rem);
    }

    .close-button {
      --mat-icon-button-icon-color: #ffffff;
      --mat-icon-button-state-layer-color: #f97316;
      position: absolute;
      top: 1rem;
      right: 1rem;
      z-index: 1;
      color: #ffffff;
      background: rgba(255, 255, 255, 0.14);
    }

    .close-button:hover,
    .close-button:focus-visible {
      background: rgba(255, 181, 118, 0.3);
    }

    @media (max-width: 640px) {
      img {
        max-width: calc(100vw - 2rem);
        max-height: calc(100dvh - 2rem);
        transform: translateY(-0.5rem);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileImageDialog {
  private readonly dialogRef = inject(MatDialogRef<ProfileImageDialog>);

  protected readonly data = inject<ProfileImageDialogData>(MAT_DIALOG_DATA);

  protected close(): void {
    this.dialogRef.close();
  }
}
