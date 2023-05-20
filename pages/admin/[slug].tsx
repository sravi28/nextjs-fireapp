import styles from "../../styles/Admin.module.css";
import AuthCheck from "../../components/AuthCheck";
import { firestore, auth, serverTimestamp } from "../../lib/firebase";

import ImageUploader from "../../components/ImageUploader";

import { useState } from "react";
import { useRouter } from "next/router";

import { useDocumentData } from "react-firebase-hooks/firestore";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatNumber } from "../../lib/utils";

export default function AdminPostEdit(props) {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  );
}

function PostManager() {
  const [preview, setPreview] = useState(false);

  // Grab slug form URL parameters to fetch data from firestore
  const router = useRouter();
  const { slug } = router.query;

  // Get reference to post in firestore
  const postRef = firestore
    .collection("users")
    .doc(auth.currentUser?.uid)
    .collection("posts")
    .doc(slug.toString());

  // Hook onto document data and listen to it in realtime
  const [post] = useDocumentData(postRef);

  return (
    <main className={styles.container}>
      {post && (
        <>
          <section>
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>

            <PostForm
              postRef={postRef}
              defaultValues={post}
              preview={preview}
            />
          </section>

          <aside>
            <h3>Tools</h3>
            {/* Button to switch between preview and edit mode */}
            <button
              title={preview ? "Edit" : "Preview"}
              style={{ marginRight: 0 }}
              onClick={() => setPreview(!preview)}
            >
              {preview ? "Edit" : "Preview"}
            </button>

            {/* Link to live view */}
            <Link legacyBehavior href={`/${post.username}/${post.slug}`}>
              <a>
                <button
                  title="Live view"
                  style={{ marginRight: 0 }}
                  className="btn-blue"
                >
                  Live view
                </button>
              </a>
            </Link>

            <DeletePostButton postRef={postRef} />
          </aside>
        </>
      )}
    </main>
  );
}

function PostForm({ postRef, defaultValues, preview }) {
  // Hook onto the entire form
  // When the data changes it will re-render the form
  // Register controls which part of the form we are interacting with
  //  Ex: textarea controls the content, checkbox controls the published status etc
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
  } = useForm({ defaultValues, mode: "onChange" });
  const [charCount, setCharCount] = useState(defaultValues.content.length);
  const maxLength = 30000;

  const updatePost = async ({ content, published }) => {
    // Write to firestore
    await postRef.update({
      content,
      published,
      updatedAt: serverTimestamp(),
    });

    // Reset validation state of the form
    reset({ content, published });

    toast.success("Post updated!");
  };

  function updateCount(e) {
    setCharCount(e.target.value.length);
  }

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {/* When in preview mode, watch the content and render it as markdown.
            Watch means it will update when changed by user */}
      {preview && (
        <div className="card markdown-word-wrap">
          <ReactMarkdown>{watch("content")}</ReactMarkdown>
        </div>
      )}

      {!preview && <ImageUploader />}

      {/* When not in preview mode, show controls for the form */}
      <div className={preview ? styles.hidden : styles.controls}>
        {/* Text input with client-side validation*/}
        <textarea
          className="custom-textarea"
          name="content"
          placeholder="Write some content here"
          onInput={updateCount}
          maxLength={maxLength}
          {...register("content", {
            required: { value: true, message: "Content is required" },
          })}
        ></textarea>

        {/* Character count indicator for textarea */}
        <div className="count-div">
          <div className="count-text">
            {formatNumber(charCount)}/{formatNumber(maxLength)}
          </div>
        </div>

        {/* Potential error message */}
        {errors?.content && (
          <p className="text-danger">{errors.content.message.toString()}</p>
        )}

        {/* Published or not checkbox */}
        <fieldset>
          <label>
            <input
              className={styles.checkbox}
              name="published"
              type="checkbox"
              {...register("published")}
            />
            Published
          </label>
        </fieldset>

        {/* Submit button
                Only disable if invalid or if user hasn't changed the content*/}
        <button
          type="submit"
          className="btn-green"
          disabled={!isValid || !isDirty}
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}

function DeletePostButton({ postRef }) {
  const router = useRouter();

  // Thanks to https://stackoverflow.com/a/64106171
  // Deleting post now deletes hearts collection with it
  const deleteHearts = async () => {
    const collectionRef = postRef.collection("hearts");

    return new Promise((resolve, reject) => {
      deleteQueryBatch(collectionRef, resolve).catch(reject);
    });
  };
  const deleteQueryBatch = async (collectionRef, resolve) => {
    const snapshot = await collectionRef.get();
    const batchSize = snapshot.size;
    if (batchSize == 0) {
      // Nothing left to delete
      resolve();
      return;
    }

    // Delete documents in a batch
    const batch = firestore.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
      deleteQueryBatch(collectionRef, resolve);
    });
  };

  const deletePost = async () => {
    const doIt = confirm("Are you sure?");
    if (doIt) {
      deleteHearts();
      await postRef.delete();
      router.push("/admin");
      toast("Post deleted!", { icon: "🗑️" });
    }
  };

  return (
    <button
      title="Delete"
      style={{ marginRight: 0 }}
      className="btn-red"
      onClick={deletePost}
    >
      Delete
    </button>
  );
}
