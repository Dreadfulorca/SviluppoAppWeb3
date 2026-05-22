import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-protected-layout',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './protected-layout.html',
  styleUrl: './protected-layout.css',
})
export class ProtectedLayout {
  private readonly authService = inject(AuthService);

  protected readonly currentUser = this.authService.currentUser;
  protected async logout(): Promise<void> {
    await this.authService.logout();
  }
}
