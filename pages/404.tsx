import Link from "next/link";
import MetaTags from "../components/Metatags";

export default function Custom404() {
  return (
    <main>
      <MetaTags title="404 page" />
      <h1>404 - That page does not seem to exist...</h1>
      <iframe
        src="https://giphy.com/embed/g01ZnwAUvutuK8GIQn"
        width="960"
        height="540"
        frameBorder="0"
        allowFullScreen
      ></iframe>
      <Link legacyBehavior href="/">
        <a>
          <button className="btn-blue">Go home</button>
        </a>
      </Link>
    </main>
  );
}
