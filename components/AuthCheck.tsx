import Link from "next/link";
import { UserContext } from "@/lib/context";
import { useContext } from "react";

const AuthCheck = (props: any) => {
  const { username } = useContext(UserContext);

  return username
    ? props.children
    : props.fallback || <Link href="/enter">You must be signed in</Link>;
};

export default AuthCheck;
