import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENTID,
};

// Sometimes NextJS will try to run the code in this file twice
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: "select_account",
});

export const firestore = firebase.firestore();

// Converts milliseconds to timestamp
export const fromMillis = firebase.firestore.Timestamp.fromMillis;

// Function used to include server-generated timestamp onto a document
export const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;

// Allows to update a count without having to know the exact number
export const increment = firebase.firestore.FieldValue.increment;

export const storage = firebase.storage();

// Used to tell progress of file upload
export const STATE_CHANGED = firebase.storage.TaskEvent.STATE_CHANGED;

// Helper functions

/**
 * Gets a users/{uid} document from a username
 * @param {string} username
 * @returns userDoc
 */
export async function getUserWithUsername(username: string) {
  const usersRef = firestore.collection("users");
  const query = usersRef.where("username", "==", username).limit(1);
  const userDoc = (await query.get()).docs[0];
  return userDoc;
}

/**
 * Converts firestore document into JSON
 * @param {firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>} doc Post document from firestore
 * @returns {JSON} JSON serialisable document
 */
export function postToJSON(
  doc: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>
) {
  const data = doc.data();
  if (!data) {
    return null;
  }

  return {
    ...data,
    // Turn firestore timestamp into JSON serialisable
    createdAt: data?.createdAt?.toMillis() || 0,
    updatedAt: data?.updatedAt?.toMillis() || 0,
  };
}
