import Link from "next/link";
import { useContext } from "react";
import { UserContext } from "../lib/context";

// Component's children will be shown only to logged-in users
export default function AuthCheck(props: any) {
  const { username } = useContext(UserContext);

  // If username show children, otherwise fallback
  return username
    ? props.children
    : props.fallback || (
        <Link href="/enter" className="text-link">
          You must be signed in
        </Link>
      );
}
