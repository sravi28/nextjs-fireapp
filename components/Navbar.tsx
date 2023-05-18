import Link from "next/link";
import { useContext } from "react";
import { UserContext } from "@/lib/context";
import { useRouter } from "next/router";

const Navbar = () => {
  const { user, username } = useContext(UserContext);

  //   const router = useRouter();

  //   const signOut = () => {
  //     auth.signOut();
  //     router.reload();
  //   };

  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link href="/">
            <button className="btn-logo">AnimeWorld</button>
          </Link>
        </li>

        {username && (
          <>
            <li className="push-left">
              <button>Sign Out</button>
            </li>
            <li>
              <Link href="/admin">
                <button className="btn-blue">Write Posts</button>
              </Link>
            </li>
            <li>
              <Link href={`/${username}`}>
                <img src={user?.photoURL || "/hacker.png"} />
              </Link>
            </li>
          </>
        )}

        {!username && (
          <li>
            <Link href="/enter">
              <button className="btn-blue">Log in</button>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
