import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { FeedApiService } from './core/api/feed-api.service';
import { Post } from './core/api/models/post.types';
import { PostsApiService } from './core/api/posts-api.service';
import { UsersApiService } from './core/api/users-api.service';
import { UserPublic } from './core/api/models/user.types';
import { AuthService } from './core/auth/auth.service';
import { ProtectedLayout } from './layouts/protected-layout/protected-layout';
import { FeedService } from './pages/home/feed.service';
import { Profile } from './pages/profile/profile';
import { PublicProfile } from './pages/public-profile/public-profile';
import { PostCard } from './shared/post-card/post-card';

const currentUser = {
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

const currentUserWithAvatar = {
  ...currentUser,
  avatarUrl: 'https://example.com/mario-avatar.jpg',
};

const publicUser = {
  id: 'user-2',
  firstName: 'Giulia',
  lastName: 'Bianchi',
  avatarUrl: null,
  bio: 'Appassionata di web development.',
  followersCount: 8,
  followingCount: 4,
  isFollowing: false,
};

const followedPublicUser = {
  ...publicUser,
  followersCount: 9,
  isFollowing: true,
};

const olderPost = createPost('post-older', '2026-05-19T08:00:00.000Z');
const newerPost = createPost('post-newer', '2026-05-21T08:00:00.000Z');
const middlePost = createPost('post-middle', '2026-05-20T08:00:00.000Z');

interface PublicProfileTestApi {
  profile: WritableSignal<UserPublic | null>;
  posts: WritableSignal<Post[]>;
  toggleFollow(): Promise<void>;
  loadProfile(userId: string): Promise<void>;
}

function createPost(id: string, createdAt: string): Post {
  return {
    id,
    author: {
      id: currentUser.id,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      avatarUrl: null,
    },
    text: `Post ${id}`,
    imageUrl: null,
    createdAt,
    likesCount: 0,
    isLiked: false,
  };
}

async function createPublicProfileFixture(
  profile = publicUser,
): Promise<{
  fixture: ComponentFixture<PublicProfile>;
  authService: { currentUser: ReturnType<typeof signal<typeof currentUser>>; updateCurrentUser: ReturnType<typeof vi.fn> };
  usersApi: {
    getById: ReturnType<typeof vi.fn>;
    getPosts: ReturnType<typeof vi.fn>;
    follow: ReturnType<typeof vi.fn>;
    unfollow: ReturnType<typeof vi.fn>;
  };
}> {
  const authService = {
    currentUser: signal(currentUser),
    updateCurrentUser: vi.fn(),
  };
  const usersApi = {
    getById: vi.fn().mockReturnValue(of(profile)),
    getPosts: vi.fn().mockReturnValue(of([olderPost, newerPost, middlePost])),
    follow: vi.fn().mockReturnValue(of(undefined)),
    unfollow: vi.fn().mockReturnValue(of(undefined)),
  };

  TestBed.configureTestingModule({
    providers: [
      provideNoopAnimations(),
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: {
          paramMap: of(convertToParamMap({ id: profile.id })),
        },
      },
      {
        provide: AuthService,
        useValue: authService,
      },
      {
        provide: UsersApiService,
        useValue: usersApi,
      },
      {
        provide: PostsApiService,
        useValue: {
          like: vi.fn().mockReturnValue(of(undefined)),
          unlike: vi.fn().mockReturnValue(of(undefined)),
          remove: vi.fn().mockReturnValue(of(undefined)),
        },
      },
    ],
  });

  const fixture = TestBed.createComponent(PublicProfile);
  fixture.detectChanges();

  return { fixture, authService, usersApi };
}

describe('social behavior', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('increments the current user following count after following another user', async () => {
    const { fixture, authService, usersApi } = await createPublicProfileFixture(publicUser);
    const component = fixture.componentInstance as unknown as PublicProfileTestApi;
    component.profile.set(publicUser);

    await component.toggleFollow();

    expect(usersApi.follow).toHaveBeenCalledWith(publicUser.id);
    expect(authService.updateCurrentUser).toHaveBeenCalledWith({
      ...currentUser,
      followingCount: currentUser.followingCount + 1,
    });
  });

  it('decrements the current user following count after unfollowing another user', async () => {
    const { fixture, authService, usersApi } = await createPublicProfileFixture(followedPublicUser);
    const component = fixture.componentInstance as unknown as PublicProfileTestApi;
    component.profile.set(followedPublicUser);

    await component.toggleFollow();

    expect(usersApi.unfollow).toHaveBeenCalledWith(followedPublicUser.id);
    expect(authService.updateCurrentUser).toHaveBeenCalledWith({
      ...currentUser,
      followingCount: currentUser.followingCount - 1,
    });
  });

  it('sorts the feed from newest to oldest', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: FeedApiService,
          useValue: {
            getFeed: vi.fn().mockReturnValue(of([olderPost, newerPost, middlePost])),
          },
        },
        {
          provide: PostsApiService,
          useValue: {
            like: vi.fn().mockReturnValue(of(undefined)),
            unlike: vi.fn().mockReturnValue(of(undefined)),
            remove: vi.fn().mockReturnValue(of(undefined)),
          },
        },
      ],
    });

    const service = TestBed.inject(FeedService);
    service.loadFeed();

    expect(service.posts().map((post) => post.id)).toEqual([
      newerPost.id,
      middlePost.id,
      olderPost.id,
    ]);
  });

  it('sorts public profile posts from newest to oldest', async () => {
    const { fixture } = await createPublicProfileFixture(publicUser);
    const component = fixture.componentInstance as unknown as PublicProfileTestApi;

    await component.loadProfile(publicUser.id);

    expect(component.posts().map((post) => post.id)).toEqual([
      newerPost.id,
      middlePost.id,
      olderPost.id,
    ]);
  });

  it('does not emit postRemoved when delete confirmation is cancelled', async () => {
    TestBed.configureTestingModule({
      providers: [provideNoopAnimations(), provideRouter([])],
    });

    const fixture = TestBed.createComponent(PostCard);
    const removedSpy = vi.fn();
    fixture.componentRef.setInput('post', newerPost);
    fixture.componentRef.setInput('currentUserId', currentUser.id);
    fixture.componentInstance.postRemoved.subscribe(removedSpy);
    fixture.detectChanges();

    const deleteButton = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.includes('Elimina')) as HTMLButtonElement;
    deleteButton.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const cancelButton = Array.from(
      document.body.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.includes('Annulla')) as HTMLButtonElement;
    cancelButton.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(removedSpy).not.toHaveBeenCalled();
  });

  it('opens and closes the phone navigation from the toolbar trigger', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            currentUser: signal(currentUser),
            logout: vi.fn(),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(ProtectedLayout);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      '.phone-menu-trigger',
    ) as HTMLButtonElement;

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.nativeElement.querySelector('#phone-navigation')).toBeNull();

    trigger.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.textContent).toContain('close');
    expect(fixture.nativeElement.querySelector('#phone-navigation')).not.toBeNull();

    trigger.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.textContent).toContain('menu');
    expect(fixture.nativeElement.querySelector('#phone-navigation')).toBeNull();
  });

  it('opens the profile avatar in a fullscreen image dialog', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            currentUser: signal(currentUserWithAvatar),
          },
        },
        {
          provide: UsersApiService,
          useValue: {
            getPosts: vi.fn().mockReturnValue(of([])),
          },
        },
        {
          provide: PostsApiService,
          useValue: {
            like: vi.fn().mockReturnValue(of(undefined)),
            unlike: vi.fn().mockReturnValue(of(undefined)),
            remove: vi.fn().mockReturnValue(of(undefined)),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(Profile);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const avatarButton = fixture.nativeElement.querySelector(
      'button[aria-label="Apri la tua foto profilo"]',
    ) as HTMLButtonElement;
    avatarButton.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const dialogImage = document.body.querySelector(
      '.image-viewer img',
    ) as HTMLImageElement | null;

    expect(dialogImage?.src).toBe(currentUserWithAvatar.avatarUrl);
    expect(dialogImage?.alt).toBe('Foto profilo di Mario Rossi');
  });
});
