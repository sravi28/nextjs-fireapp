import styles from "@/styles/Admin.module.css";
import AuthCheck from "@/components/AuthCheck";
import { firestore, auth, serverTimestamp } from "@/lib/firebase";

import { useState } from "react";
import { useRouter } from "next/router";

import { useDocumentDataOnce } from "react-firebase-hooks/firestore";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import toast from "react-hot-toast";
import ImageUploader from "@/components/ImageUploader";

const PostManager = () => {
  const [preview, setPreview] = useState(false);

  const router = useRouter();
  const { slug } = router.query;

  const postRef = firestore
    .collection("users")
    .doc(auth.currentUser!.uid)
    .collection("posts")
    .doc(slug as string);
  const [post] = useDocumentDataOnce(postRef);

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
            <button onClick={() => setPreview(!preview)}>
              {preview ? "Edit" : "Preview"}
            </button>
            <Link href={`/${post.username}/${post.slug}`}>
              <button className="btn-blue">Live view</button>
            </Link>
            <DeletePostButton postRef={postRef} />
          </aside>
        </>
      )}
    </main>
  );
};

const PostForm = ({
  defaultValues,
  postRef,
  preview,
}: {
  defaultValues: any;
  postRef: any;
  preview: boolean;
}) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    formState,
    reset,
    watch,
  } = useForm({
    defaultValues,
    mode: "onChange",
  });

  const { isValid, isDirty } = formState;

  const updatePost = async ({
    content,
    published,
  }: {
    content: string;
    published: boolean;
  }) => {
    await postRef.update({
      content,
      published,
      updatedAt: serverTimestamp(),
    });

    reset({ content, published });

    toast.success("Post updated successfully!");
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className="card">
          <ReactMarkdown>{watch("content")}</ReactMarkdown>
        </div>
      )}

      <div className={preview ? styles.hidden : styles.controls}>
        <ImageUploader />
        <textarea
          {...register("content", {
            required: true,
            maxLength: 20000,
            minLength: 10,
          })}
        ></textarea>

        {/* {errors.content && (
          <p className="text-danger">{errors.content?.message}</p>
        )} */}

        <fieldset>
          <input
            className={styles.checkbox}
            type="checkbox"
            {...register("published", { required: false })}
          />
          <label>Published</label>
        </fieldset>

        <button
          type="submit"
          className="btn-green"
          disabled={!isDirty || !isValid}
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

const DeletePostButton = ({ postRef }: { postRef: any }) => {
  const router = useRouter();

  const deletePost = async () => {
    const doIt = confirm("are you sure!");
    if (doIt) {
      await postRef.delete();
      router.push("/admin");
      toast("post annihilated ", { icon: "🗑️" });
    }
  };

  return (
    <button className="btn-red" onClick={deletePost}>
      Delete
    </button>
  );
};

const AdminPostEdit = () => {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  );
};

export default AdminPostEdit;
