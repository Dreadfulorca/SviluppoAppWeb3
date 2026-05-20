import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { UserSearchResult } from '../../core/api/models/user.types';
import { UsersApiService } from '../../core/api/users-api.service';
import { extractHttpErrorMessage } from '../../core/http/extract-http-error-message';

interface UserSearchFormModel {
  query: string;
}

@Component({
  selector: 'app-user-search',
  imports: [FormField, FormRoot, MatButtonModule, MatInputModule, RouterLink],
  templateUrl: './user-search.html',
  styleUrl: './user-search.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSearch {
  private readonly usersApi = inject(UsersApiService);

  protected readonly model = signal<UserSearchFormModel>({
    query: '',
  });

  protected readonly results = signal<UserSearchResult[]>([]);
  protected readonly loading = signal(false);
  protected readonly searched = signal(false);

  protected readonly isEmpty = computed(
    () => this.searched() && !this.loading() && this.results().length === 0,
  );

  protected readonly form = form(
    this.model,
    (search) => {
      required(search.query, { message: 'Inserisci nome o cognome da cercare.' });
    },
    {
      submission: {
        action: async () => {
          const query = this.model().query.trim();

          if (!query) {
            this.results.set([]);
            this.searched.set(false);
            return;
          }

          try {
            this.loading.set(true);
            this.results.set(await firstValueFrom(this.usersApi.search(query)));
            this.searched.set(true);
            return;
          } catch (error: unknown) {
            return {
              kind: 'serverError',
              message: extractHttpErrorMessage(error, 'Ricerca utenti non riuscita.'),
            };
          } finally {
            this.loading.set(false);
          }
        },
        onInvalid: (field) => {
          field().errorSummary()[0]?.fieldTree().focusBoundControl();
        },
      },
    },
  );
}
