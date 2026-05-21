import { Post } from './post.types';

export function sortPostsByNewest(posts: Post[]): Post[] {
  return [...posts].sort(
    (firstPost, secondPost) =>
      new Date(secondPost.createdAt).getTime() - new Date(firstPost.createdAt).getTime(),
  );
}
