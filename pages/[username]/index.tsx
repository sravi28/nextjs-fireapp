import UserProfile from "../../components/UserProfile";
import PostFeed from "../../components/PostFeed";
import { getUserWithUsername, postToJSON } from "../../lib/firebase";
import MetaTags from "../../components/Metatags";

export async function getServerSideProps({ query }) {
  const { username } = query;

  const userDoc = await getUserWithUsername(username);

  // If no user is found, short circuit to 404
  if (!userDoc) {
    return {
      notFound: true,
    };
  }

  // JSON serialisable data
  let user = null;
  let posts = null;

  if (userDoc) {
    user = userDoc.data();
    const postsQuery = userDoc.ref
      .collection("posts")
      .where("published", "==", true)
      .orderBy("createdAt", "desc")
      .limit(5);

    posts = (await postsQuery.get()).docs.map(postToJSON);
  }

  return {
    props: { user, posts }, // will be passed to the page after being rendered on the server
  };
}

export default function UserProfilePage({ user, posts }) {
  return (
    <main>
      <MetaTags
        title={`${user.username}'s profile page`}
        description={`${user.displayName}'s profile page`}
      />
      <UserProfile user={user} />
      <PostFeed posts={posts} admin />
    </main>
  );
}
