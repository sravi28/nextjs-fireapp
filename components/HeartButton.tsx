import { useDocument } from "react-firebase-hooks/firestore";
import { auth, firestore, increment } from "../lib/firebase";

// Takes reference to a post as prop
export default function HeartButton({ postRef }: { postRef: any }) {
  // Listen to the authenticated user's 'heart' document on the post
  const heartRef = postRef.collection("hearts").doc(auth.currentUser?.uid);
  const [heartDoc] = useDocument(heartRef);

  const addHeart = async () => {
    const uid = auth.currentUser.uid;

    // Create batch to update 2 documents at once, they must succeed/fail together
    const batch = firestore.batch();
    // Increment post's heartCount by 1
    batch.update(postRef, { heartCount: increment(1) });
    // Add uid document to post hearts collection to tell us user has liked it
    batch.set(heartRef, { uid });

    await batch.commit();
  };

  const removeHeart = async () => {
    const batch = firestore.batch();
    batch.update(postRef, { heartCount: increment(-1) });
    // Delete existing heart document
    batch.delete(heartRef);

    await batch.commit();
  };

  // If the document exists then user has hearted post, otherwise they haven't
  return heartDoc?.exists ? (
    <button title="Unheart" className="btn-heart" onClick={removeHeart}>
      💔 Unheart
    </button>
  ) : (
    <button title="Heart" className="btn-heart" onClick={addHeart}>
      💗 Heart
    </button>
  );
}
