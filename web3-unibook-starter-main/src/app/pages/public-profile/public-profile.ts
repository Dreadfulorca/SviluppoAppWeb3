import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.html',
  styleUrl: './public-profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicProfile {
  private readonly route = inject(ActivatedRoute);

  protected readonly userId = this.route.snapshot.paramMap.get('id') ?? '';
}
