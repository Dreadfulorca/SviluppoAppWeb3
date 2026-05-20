import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-edit',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './profile-edit.html',
  styleUrl: './profile-edit.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileEdit {}
