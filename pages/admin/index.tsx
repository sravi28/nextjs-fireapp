import MetaTags from "../../components/Metatags";
import styles from "../../styles/Admin.module.css";
import AuthCheck from "../../components/AuthCheck";
import PostFeed from "../../components/PostFeed";
import { UserContext } from "../../lib/context";
import { firestore, auth, serverTimestamp } from "../../lib/firebase";

import { useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";

import { useCollection } from "react-firebase-hooks/firestore";
import kebabCase from "lodash.kebabcase";
import toast from "react-hot-toast";
import debounce from "lodash.debounce";
import InputValidationMessage from "../../components/InputValidationMessage";

export default function AdminPostsPage({}) {
  return (
    <main>
      <MetaTags title="Admin page" />
      <AuthCheck>
        <PostList />
        <CreateNewPost />
      </AuthCheck>
    </main>
  );
}

function PostList() {
  // Reference to the currently authenticated user's posts in firestore
  const ref = firestore
    .collection("users")
    .doc(auth?.currentUser?.uid)
    .collection("posts");
  const query = ref.orderBy("createdAt");

  // Hook to read collection in realtime
  const [querySnapshot] = useCollection(query);

  // Get the data from each post document
  const posts = querySnapshot?.docs.map((doc) => doc.data());

  return (
    <>
      <h1>Manage your posts!</h1>
      <PostFeed posts={posts} admin />
    </>
  );
}

function CreateNewPost() {
  const router = useRouter();
  const { username } = useContext(UserContext);

  const [title, setTitle] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ensure slug is URI safe
  const slug = encodeURI(kebabCase(title));

  // Check slug validity when title changes
  useEffect(() => {
    checkSlug(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  const onChange = (e) => {
    setTitle(e.target.value);
    setLoading(true);
    setIsValid(false);
  };

  // Checks slug against firestore to avoid duplicates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkSlug = useCallback(
    debounce(async (slug) => {
      if (slug.length >= 3 && slug.length <= 100) {
        const ref = firestore
          .collection("users")
          .doc(auth.currentUser.uid)
          .collection("posts")
          .doc(slug);
        const { exists } = await ref.get();
        console.log(`Firestore read executed for ${slug}`);
        setIsValid(!exists);
        setLoading(false);
      } else {
        setIsValid(false);
        setLoading(false);
      }
    }, 500),
    []
  );

  const createPost = async (e) => {
    e.preventDefault();
    const uid = auth.currentUser.uid;

    // Reference to a post that doesn't exist yet
    const ref = firestore
      .collection("users")
      .doc(uid)
      .collection("posts")
      .doc(slug);

    // Data that will go into newly created post
    const data = {
      title,
      slug,
      uid,
      username,
      published: false,
      content: "# Hello World!",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      heartCount: 0,
    };

    // Commit document to firestore
    await ref.set(data);

    toast.success("Post Created!");

    // Force navigate to the post's edit page
    router.push(`/admin/${slug}`);
  };

  return (
    <form onSubmit={createPost}>
      <input
        title="Post title"
        value={title}
        onChange={onChange}
        placeholder="Create a new post"
        className={styles.input}
      />

      <p>
        <strong>Slug: </strong> {slug}
      </p>

      <InputValidationMessage
        value={title}
        valueName="title"
        isValid={isValid}
        loading={loading}
      />

      <button
        title="Create new post"
        type="submit"
        disabled={!isValid}
        className="btn-green"
      >
        Create new post
      </button>
    </form>
  );
}
