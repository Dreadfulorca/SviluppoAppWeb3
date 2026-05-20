import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.html',
  styleUrl: './user-search.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSearch {}
