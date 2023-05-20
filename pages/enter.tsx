/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import { auth, firestore, googleAuthProvider } from "../lib/firebase";
import { useCallback, useContext, useEffect, useState } from "react";
import debounce from "lodash.debounce";
import { useRouter } from "next/router";
import { UserContext } from "../lib/context";
import SignOutButton from "../components/SignOutButton";
import MetaTags from "../components/Metatags";
import InputValidationMessage from "../components/InputValidationMessage";

export default function Enter() {
  <MetaTags title="Login page" />;

  const { user, username } = useContext(UserContext);

  /*
    1. User signed out => Show SignInButton
    2. User signed in but no username => Show UsernameForm
    3. User signed in and has username => Bring to their profile
    */
  const router = useRouter();

  if (user && username) {
    router.push(`/${username}`);
  }

  return (
    <main>
      {user ? (
        username ? (
          <SignOutButton />
        ) : (
          <UsernameForm />
        )
      ) : (
        <SignInButton />
      )}
    </main>
  );
}

// Sign in with Google Button
function SignInButton() {
  const signInWithGoogle = async () => {
    await auth.signInWithPopup(googleAuthProvider);
  };

  return (
    <>
      <button className="btn-google" onClick={signInWithGoogle}>
        <img src={"/google.png"} width="30px" alt="Google logo" /> Sign in with
        Google
      </button>
    </>
  );
}

function UsernameForm() {
  const [formValue, setFormValue] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, username } = useContext(UserContext);

  // Call checkUsername everytime the formValue changes
  useEffect(() => {
    checkUsername(formValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValue]);

  const onChange = (e) => {
    // Set username to lowercase
    const val = e.target.value; /*.toLowerCase()*/

    // Regex to exclude unwanted characters
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

    // Disable validating if username is too short
    if (val.length < 3 || val.length > 100) {
      setFormValue(val);
      setLoading(false);
      setIsValid(false);
    }

    // Regex check
    if (re.test(val)) {
      setFormValue(val);
      setLoading(true);
      setIsValid(false);
    }
  };

  // Check database for username match after each debounced change
  // useCallback is required for debounce
  // Debounce means it will wait for user to stop typing for 500ms before executing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username.length >= 3) {
        const ref = firestore.doc(`usernames/${username}`);
        const { exists } = await ref.get();
        console.log(`Firestore read executed for ${username}`);
        setIsValid(!exists);
        setLoading(false);
      } else {
        setIsValid(false);
        setLoading(false);
      }
    }, 500),
    []
  );

  const onSubmit = async (e) => {
    e.preventDefault();

    // Create refs for both documents in firebase
    const userDoc = firestore.doc(`users/${user.uid}`);
    const usernameDoc = firestore.doc(`usernames/${formValue}`);

    // Commit both docs together
    const batch = firestore.batch();
    batch.set(userDoc, {
      username: formValue,
      photoURL: user.photoURL,
      displayName: user.displayName,
    });
    batch.set(usernameDoc, { uid: user.uid });

    await batch.commit();
  };

  return (
    !username && (
      <section>
        <h3>Choose Username</h3>
        <form onSubmit={onSubmit}>
          <input
            title="username"
            name="username"
            placeholder="username"
            value={formValue}
            onChange={onChange}
          ></input>

          <InputValidationMessage
            value={formValue}
            valueName="username"
            isValid={isValid}
            loading={loading}
          />

          <button type="submit" className="btn-green" disabled={!isValid}>
            Choose
          </button>
        </form>
      </section>
    )
  );
}
