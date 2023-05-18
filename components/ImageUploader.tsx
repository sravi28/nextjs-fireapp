import { useState } from "react";
import { auth, storage, STATE_CHANGED } from "@/lib/firebase";
import Loader from "./Loader";

const ImageUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState<string | null>(null);

  const uploadFile = async (e: any) => {
    const file = Array.from(e.target.files)[0] as any;
    const extension = file.type.split("/")[1];

    const ref = storage.ref(
      `uploads/${auth.currentUser!.uid}/${Date.now()}.${extension}`
    );

    setUploading(true);

    const task = ref.put(file);

    task.on(STATE_CHANGED, (snapshot) => {
      setProgress(
        Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
      );

      // task.then is not a native promise, so we can't use async/await
      task.then((d) =>
        // getDownloadURL() is only available after file has finished uploading
        ref.getDownloadURL().then((url) => {
          setDownloadURL(url);
          setUploading(false);
        })
      );
    });
  };

  return (
    <div className="box">
      <Loader show={uploading} />
      {uploading && <h3>{progress}%</h3>}

      {!uploading && (
        <label className="btn">
          📸 Upload Img
          <input
            type="file"
            onChange={uploadFile}
            accept="image/x-png,image/gif,image/jpeg"
          />
        </label>
      )}

      {downloadURL && (
        <code className="upload-snippet">{`![alt](${downloadURL})`}</code>
      )}
    </div>
  );
};

export default ImageUploader;
