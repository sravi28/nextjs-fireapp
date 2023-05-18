import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "@/lib/firebase";
import { useEffect, useState } from "react";

const useUserData = () => {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState<string>();

  useEffect(() => {
    let unsubscribe: any;
    if (user)
      unsubscribe = firestore
        .collection("users")
        .doc(user.uid)
        .onSnapshot((doc) => {
          setUsername(doc.data()?.username);
        });
    else setUsername(undefined);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  return { user, username };
};

export default useUserData;
