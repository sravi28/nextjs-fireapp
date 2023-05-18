import type { GetServerSideProps } from "next";
import Link from "next/link";
import { firestore, getUserWithUsername, postToJSON } from "@/lib/firebase";
import styles from "@/styles/Post.module.css";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useContext } from "react";
import { UserContext } from "@/lib/context";
import AuthCheck from "@/components/AuthCheck";
import HeartButton from "@/components/HeartButton";
import PostContent from "@/components/PostContent";

// SSG, then client-side hydration for real-time updates

export const getStaticProps: GetServerSideProps = async ({ params }) => {
  const { username, slug } = params as {
    username: string;
    slug: string;
  };
  const userDoc = await getUserWithUsername(username);

  let post;
  let path;

  if (userDoc) {
    const postRef = userDoc.ref.collection("posts").doc(slug);
    post = postToJSON(await postRef.get());

    path = postRef.path;
  }

  return {
    props: { post, path },
    revalidate: 5000,
  };
};

export async function getStaticPaths() {
  // Improve my using Admin SDK to select empty docs
  // Jeff said during the course that there's a more efficient way to do this with the Admin SDK that doesn't use a collection group query
  const snapshot = await firestore.collectionGroup("posts").get();

  const paths = snapshot.docs.map((doc) => {
    const { slug, username } = doc.data();
    return {
      params: { username, slug },
    };
  });

  return {
    // must be in this format:
    // paths: [
    //   { params: { username, slug }}
    // ],
    paths,
    // If a post is not statically generated (e.g. newly created after static generation), fallback: 'blocking' will fallback to regular server side rendering instead of returning 404
    fallback: "blocking",
  };
}

const PostPage = (props: any) => {
  const postRef = firestore.doc(props.path);
  // Extra document read client-side to hydrate the realtime data feed
  const [realtimePost] = useDocumentData(postRef);

  const post = realtimePost || props.post;

  const { user: currentUser } = useContext(UserContext);

  return (
    <main className={styles.container}>
      <section>
        <PostContent post={post} />
      </section>

      <aside className="card">
        <p>
          <strong>{post.heartCount || 0} 🤍</strong>
        </p>

        <AuthCheck
          fallback={
            <Link href="/enter">
              <button>💗 Sign Up</button>
            </Link>
          }
        >
          <HeartButton postRef={postRef} />
        </AuthCheck>

        {currentUser?.uid === post.uid && (
          <Link href={`/admin/${post.slug}`}>
            <button className="btn-blue">Edit Post</button>
          </Link>
        )}
      </aside>
    </main>
  );
};

export default PostPage;
