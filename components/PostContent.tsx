import Link from "next/link";
import ReactMarkdown from "react-markdown";

// UI component for main post content
export default function PostContent({ post }: { post: any }) {
  const createdAt =
    typeof post?.createdAt === "number"
      ? new Date(post.createdAt)
      : post.createdAt.toDate();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return (
    <div className="card">
      <h1>{post?.title}</h1>
      <span className="text-sm">
        Written by{" "}
        <Link href={`/${post.username}/`} className="text-info">
          @{post.username}
        </Link>{" "}
        on {createdAt.toLocaleDateString("en-GB", options)}
      </span>
      <ReactMarkdown className="markdown-word-wrap">
        {post?.content}
      </ReactMarkdown>
    </div>
  );
}
