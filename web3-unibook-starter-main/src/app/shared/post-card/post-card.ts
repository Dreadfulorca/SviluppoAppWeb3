import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { Post } from '../../core/api/models/post.types';

@Component({
  selector: 'app-confirm-post-delete-dialog',
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Eliminare il post?</h2>
    <mat-dialog-content>
      <p>Questa azione è definitiva e non può essere annullata.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="cancel()">Annulla</button>
      <button mat-flat-button color="warn" type="button" class="confirm-button" (click)="confirm()">
        Elimina
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    p {
      margin: 0;
      color: #475569;
      line-height: 1.6;
    }

    .confirm-button {
      --mdc-filled-button-container-color: #b91c1c;
      --mdc-filled-button-label-text-color: #ffffff;
      --mat-filled-button-state-layer-color: #ffffff;
      background-color: #b91c1c;
      color: #ffffff;
    }

    .confirm-button:hover {
      background-color: #991b1b;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmPostDeleteDialog {
  private readonly dialogRef = injectDialogRef();

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  protected confirm(): void {
    this.dialogRef.close(true);
  }
}

function injectDialogRef(): MatDialogRef<ConfirmPostDeleteDialog, boolean> {
  return inject(MatDialogRef<ConfirmPostDeleteDialog, boolean>);
}

@Component({
  selector: 'app-post-card',
  imports: [DatePipe, MatButtonModule, MatCardModule, MatIconModule, RouterLink],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostCard {
  private readonly dialog = inject(MatDialog);

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
    this.dialog
      .open<ConfirmPostDeleteDialog, void, boolean>(ConfirmPostDeleteDialog, {
        ariaLabel: 'Conferma eliminazione post',
        autoFocus: 'dialog',
        restoreFocus: true,
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.postRemoved.emit(this.post().id);
        }
      });
  }
}
