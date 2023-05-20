import { useRouter } from "next/router";
import { auth } from "../lib/firebase";

export default function SignOutButton({}) {
  const router = useRouter();
  const signOut = () => {
    router.push("/");
    auth.signOut();
  };
  return (
    <button title="Sign Out" onClick={signOut}>
      {" "}
      Sign Out
    </button>
  );
}
