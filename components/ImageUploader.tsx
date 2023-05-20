import { ChangeEvent, useState } from "react";
import { auth, storage, STATE_CHANGED } from "../lib/firebase";
import Loader from "./Loader";

// Uploads images to firebase storage
export default function ImageUploader({}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("0");
  const [downloadUrl, setDownloadUrl] = useState(null);

  // Creates Firebase upload task
  const uploadFile = async (e: ChangeEvent) => {
    // Get the file
    const target = e.target as HTMLInputElement;
    const file = target.files[0] as File;
    // Get the extension
    const extension = file.type.split("/")[1];

    // Make reference to where the image will be uploaded in the storage bucket
    // File name is generated as date.now to avoid overriding
    const ref = storage.ref(
      `uploads/${auth.currentUser.uid}/${Date.now()}.${extension}`
    );
    setUploading(true);

    // Start the upload
    const task = ref.put(file);

    // Listen to progress
    // On state change, runs callback which gives us access to snapshot of the upload which has useful metadata
    task.on(STATE_CHANGED, (snapshot) => {
      const percentUploaded = (
        (snapshot.bytesTransferred / snapshot.totalBytes) *
        100
      ).toFixed(0);
      setProgress(percentUploaded);

      // Get downloadURL AFTER task resolves
      task
        .then(() => ref.getDownloadURL())
        .then((url) => {
          setDownloadUrl(url);
          setUploading(false);
        });
    });
  };

  return (
    <div className="box">
      <Loader show={uploading} />

      {uploading && <h3>{progress}%</h3>}

      {!uploading && (
        <>
          <label className="btn">
            📸 Upload Img
            <input
              type="file"
              onChange={uploadFile}
              accept="image/x-png,image/gif,image/jpeg"
            />
          </label>
        </>
      )}

      {downloadUrl && (
        <div className="grid-image-upload-snippet">
          <p>Copy and paste this into your post:</p>
          <code className="upload-snippet">{`![alt](${downloadUrl})`}</code>
        </div>
      )}
    </div>
  );
}
