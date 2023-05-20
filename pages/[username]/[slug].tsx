import styles from "../../styles/Post.module.css";
import { firestore, getUserWithUsername, postToJSON } from "../../lib/firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";
import PostContent from "../../components/PostContent";
import MetaTags from "../../components/Metatags";
import HeartCount from "../../components/HeartCount";
import AuthCheck from "../../components/AuthCheck";
import HeartButton from "../../components/HeartButton";
import Link from "next/link";
import { useContext } from "react";
import { UserContext } from "../../lib/context";

// Tells next to get data from server at build time
export async function getStaticProps({ params }) {
  // Comes from the URL parameters
  const { username, slug } = params;

  // Get user doc from firestore
  const userDoc = await getUserWithUsername(username);

  let post;
  let path;

  if (userDoc) {
    // If user doc exists then get the post using the slug as ID
    const postRef = userDoc.ref.collection("posts").doc(slug);

    post = postToJSON(await postRef.get());
    // If no post is found, short circuit to 404
    if (!post) {
      return {
        notFound: true,
      };
    }

    // This will be used to make it easier to refetch data during later hydration
    path = postRef.path;
  }

  // Return this as props to the page
  return {
    props: { post, path },
    revalidate: 5000, // Next will regenerate page at most every 5s
  };
}

// Tells next which post corresponds to which path
export async function getStaticPaths() {
  const snapshot = await firestore.collectionGroup("posts").get();

  const paths = snapshot.docs.map((doc) => {
    const { slug, username } = doc.data();
    return {
      params: { username, slug },
    };
  });

  return {
    paths,
    fallback: "blocking", // When an unrendered page is accessed, this forces Next to manually server-side render it
  };
}

export default function Post(props: any) {
  // Easy access to document with direct path inside firestore
  const postRef = firestore.doc(props.path);
  const [realtimePost] = useDocumentData(postRef);
  const { username } = useContext(UserContext);

  // Gets the latest version of the post, or fallsback to the prerendered data
  const post = realtimePost || props.post;

  return (
    <main className={styles.container}>
      <MetaTags
        title={post?.title || "Post title"}
        description={`Post by ${post?.username}`}
      />

      <section>
        <PostContent post={post} />
      </section>

      <aside className="card">
        <div>
          <strong>
            <HeartCount heartCount={post.heartCount} />
          </strong>
        </div>

        {/* Show heart button for signed-in users, or link to sign-up page */}
        <AuthCheck
          fallback={
            <Link legacyBehavior href="/enter">
              <a>
                <button title="Sign Up" className="btn-heart">
                  💗 Sign Up
                </button>
              </a>
            </Link>
          }
        >
          <HeartButton postRef={postRef} />
          {username == post.username && (
            <Link legacyBehavior href={`/admin/${post.slug}`}>
              <a>
                <button
                  style={{ marginRight: 0 }}
                  className="btn-blue"
                  title="Edit"
                >
                  Edit
                </button>
              </a>
            </Link>
          )}
        </AuthCheck>
      </aside>
    </main>
  );
}
