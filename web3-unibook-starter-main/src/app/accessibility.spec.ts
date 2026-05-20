import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import axe from 'axe-core';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { Post } from './core/api/models/post.types';
import { UserPrivate, UserPublic } from './core/api/models/user.types';
import { PostsApiService } from './core/api/posts-api.service';
import { UsersApiService } from './core/api/users-api.service';
import { AuthService } from './core/auth/auth.service';
import { CreatePostForm } from './pages/home/create-post-form';
import { Profile } from './pages/profile/profile';
import { ProfileEdit } from './pages/profile-edit/profile-edit';
import { PublicProfile } from './pages/public-profile/public-profile';
import { UserSearch } from './pages/user-search/user-search';
import { PostCard } from './shared/post-card/post-card';

const currentUser: UserPrivate = {
  id: 'user-1',
  email: 'mario.rossi@example.com',
  firstName: 'Mario',
  lastName: 'Rossi',
  birthDate: '1998-04-15',
  avatarUrl: null,
  bio: 'Studente di informatica.',
  followersCount: 3,
  followingCount: 5,
};

const publicUser: UserPublic = {
  id: 'user-2',
  firstName: 'Giulia',
  lastName: 'Bianchi',
  avatarUrl: null,
  bio: 'Appassionata di web development.',
  followersCount: 8,
  followingCount: 4,
  isFollowing: false,
};

const post: Post = {
  id: 'post-1',
  author: {
    id: currentUser.id,
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    avatarUrl: null,
  },
  text: 'Primo post di prova.',
  imageUrl: null,
  createdAt: '2026-05-20T10:00:00.000Z',
  likesCount: 2,
  isLiked: false,
};

async function expectNoAxeViolations(element: HTMLElement): Promise<void> {
  const result = await axe.run(element, {
    rules: {
      // jsdom does not compute real browser colors/layout reliably enough for contrast checks.
      'color-contrast': { enabled: false },
    },
  });

  expect(result.violations).toEqual([]);
}

describe('accessibility', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            currentUser: signal(currentUser),
          },
        },
        {
          provide: UsersApiService,
          useValue: {
            getById: vi.fn().mockReturnValue(of(publicUser)),
            getPosts: vi.fn().mockReturnValue(of([post])),
            follow: vi.fn().mockReturnValue(of(undefined)),
            unfollow: vi.fn().mockReturnValue(of(undefined)),
            search: vi.fn().mockReturnValue(of([])),
            updateMe: vi.fn().mockReturnValue(of(currentUser)),
          },
        },
        {
          provide: PostsApiService,
          useValue: {
            like: vi.fn().mockReturnValue(of(undefined)),
            unlike: vi.fn().mockReturnValue(of(undefined)),
            remove: vi.fn().mockReturnValue(of(undefined)),
            create: vi.fn().mockReturnValue(of(post)),
          },
        },
      ],
    });
  });

  it('passes axe checks for the post card', async () => {
    const fixture = TestBed.createComponent(PostCard);
    fixture.componentRef.setInput('post', post);
    fixture.componentRef.setInput('currentUserId', currentUser.id);
    fixture.detectChanges();

    await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
  });

  it('passes axe checks for the create post form', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    const fixture = TestBed.createComponent(CreatePostForm);
    fixture.detectChanges();

    await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
  });

  it('passes axe checks for the user search page', async () => {
    const fixture = TestBed.createComponent(UserSearch);
    fixture.detectChanges();

    await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
  });

  it('passes axe checks for the personal profile page', async () => {
    const fixture = TestBed.createComponent(Profile);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
  });

  it('passes axe checks for the profile edit page', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    const fixture = TestBed.createComponent(ProfileEdit);
    fixture.detectChanges();

    await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
  });

  it('passes axe checks for the public profile page', async () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: {
        paramMap: of(convertToParamMap({ id: publicUser.id })),
      },
    });

    const fixture = TestBed.createComponent(PublicProfile);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    await expectNoAxeViolations(fixture.nativeElement as HTMLElement);
  });
});
