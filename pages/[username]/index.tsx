import type { GetServerSideProps } from "next";
import PostFeed from "@/components/PostFeed";
import UserProfile from "@/components/UserProfile";
import { getUserWithUsername, postToJSON } from "@/lib/firebase";

// SSR

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { username } = query;
  const userDoc = await getUserWithUsername(username as string);
  let user = null;
  let posts = null;

  if (!userDoc) return { notFound: true };

  user = userDoc.data();
  posts = (
    await userDoc.ref
      .collection("posts")
      .where("published", "==", true)
      .orderBy("createdAt", "desc")
      .limit(5)
      .get()
  ).docs.map(postToJSON);

  // Returned props must be serializable to JSON (i.e. Firestore timestamp must be converted)
  return {
    props: {
      user,
      posts,
    },
  };
};

const UserPage = ({ user, posts }: { user: any; posts: any }) => {
  return (
    <main>
      <UserProfile user={user} />
      <PostFeed posts={posts} />
    </main>
  );
};

export default UserPage;
