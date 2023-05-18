import { GetServerSideProps } from "next";
import { useState } from "react";
import PostFeed from "@/components/PostFeed";
import { firestore, fromMillis, postToJSON } from "@/lib/firebase";

// SSR, then client side rendering for additional data

const LIMIT = 5;

export const getServerSideProps: GetServerSideProps = async () => {
  const postsQuery = firestore
    .collectionGroup("posts")
    .where("published", "==", true)
    .orderBy("createdAt", "desc")
    .limit(LIMIT);

  const posts = (await postsQuery.get()).docs.map(postToJSON);

  return {
    props: { posts },
  };
};

const Home = (props: any) => {
  const [posts, setPosts] = useState(props.posts);
  const [loading, setLoading] = useState(false);
  const [postsEnd, setPostsEnd] = useState(false);

  const getMorePosts = async () => {
    setLoading(true);
    const last = posts[posts.length - 1];

    // createdAt will be a number if fetched from server or Firestore timestamp if fetched from the client
    const cursor =
      typeof last.createdAt === "number"
        ? fromMillis(last.createdAt)
        : last.createdAt;

    const newPosts = (
      await firestore
        .collectionGroup("posts")
        .where("published", "==", true)
        .orderBy("createdAt", "desc")
        .startAfter(cursor)
        .limit(LIMIT)
        .get()
    ).docs.map((doc) => doc.data());
    setPosts(posts.concat(newPosts));
    setLoading(false);

    if (newPosts.length < LIMIT) setPostsEnd(true);
  };

  return (
    <main>
      <PostFeed posts={posts} />
      {!loading && !postsEnd && (
        <button onClick={getMorePosts}>Load more</button>
      )}
      {postsEnd && "You have reached the end!"}
    </main>
  );
};

export default Home;
