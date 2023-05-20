import { useState } from "react";
import { firestore, postToJSON } from "../lib/firebase";

import PostFeed from "../components/PostFeed";
import Loader from "../components/Loader";
import MetaTags from "../components/Metatags";
import { fromMillis } from "../lib/firebase";

const DEFAULT_LIMIT = 10;

// Have the server get the latest posts from firestore
export async function getServerSideProps() {
  const postsQuery = firestore
    .collectionGroup("posts")
    .where("published", "==", true)
    .orderBy("createdAt", "desc")
    .limit(DEFAULT_LIMIT);

  const posts = (await postsQuery.get()).docs.map(postToJSON);

  // Will be passed to the page component as props
  return {
    props: { posts },
  };
}

export default function Home(props: { posts: any }) {
  // Use posts as state
  const [posts, setPosts] = useState(props.posts);

  // Loading posts state
  const [loading, setLoading] = useState(false);

  // State indicating we've reached the end of available posts
  const [postsEnd, setPostsEnd] = useState(false);

  const getMorePosts = async () => {
    if (posts.length == 0) {
      setPostsEnd(true);
      return;
    }

    // Max post to query per page
    const LIMIT_ELEMENT = document.getElementById("limit") as HTMLOptionElement;

    setLoading(true);

    // Get the last post from the current list to run a paginated query
    const last = posts[posts.length - 1];

    // To run paginated query we need a firestore timestamp
    // Depending on where the last post was fetched (client or firestore) we might need to convert to firestore timestamp
    const cursor =
      typeof last.createdAt === "number"
        ? fromMillis(last.createdAt)
        : last.createdAt;

    // Build query
    var limitValue = parseInt(LIMIT_ELEMENT.value);
    const query = firestore
      .collectionGroup("posts")
      .where("published", "==", true)
      .orderBy("createdAt", "desc")
      .startAfter(cursor)
      .limit(limitValue);

    // Get data
    const newPosts = (await query.get()).docs.map((doc) => doc.data());

    // Add new posts to existing ones
    setPosts(posts.concat(newPosts));
    setLoading(false);

    // If we get less than the limit then we've reached the end
    if (newPosts.length < limitValue) {
      setPostsEnd(true);
    }
  };

  return (
    <main>
      <MetaTags
        title="Home page"
        description="Main home page for Frazic's post feed website"
        image="https://lh3.googleusercontent.com/a-/AFdZucpBLmv3DVtRfYoHQAqKDmAMJD0F61KyFVffI3hf0w=s96-c"
      />
      <PostFeed posts={posts} admin={false} />

      <ul className="footer">
        <li>
          {/* Show load more button if we're not loading and aren't at the end  */}
          {posts.length > 0 && !loading && !postsEnd && (
            <button title="Load more posts" onClick={getMorePosts}>
              Load more
            </button>
          )}
          {/* Loader will be visible when loading=true */}
          <Loader show={loading} />

          {/* Show message when at end of posts */}
          {postsEnd && <strong>{"You've reached the end!"}</strong>}
        </li>
        <li className="push-right">
          {!postsEnd && (
            <>
              <label htmlFor="limit">Posts to load: </label>
              <select className="footer" name="limit" id="limit">
                <option className="footer" value={DEFAULT_LIMIT}>
                  {DEFAULT_LIMIT.toString()}
                </option>
                <option className="footer" value={25}>
                  25
                </option>
                <option className="footer" value={50}>
                  50
                </option>
                <option className="footer" value={100}>
                  100
                </option>
              </select>
            </>
          )}
        </li>
      </ul>
    </main>
  );
}
