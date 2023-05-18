import type firebase from "firebase/app";
import { createContext } from "react";
export const UserContext = createContext<{
  user: firebase.User | null | undefined;
  username: string | null | undefined;
}>({ user: null, username: null });
