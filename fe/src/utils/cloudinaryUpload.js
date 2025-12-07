export const cloudinaryUpload = async (file, setUploading) => {
  try {
    setUploading?.(true);

    const CLOUD_NAME = "dqvtj4uxo";
    const UPLOAD_PRESET = "ml_default"; 

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      { method: "POST", body: formData }
    );

    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();
    return data.secure_url;

  } catch (err) {
    console.error("❌ Upload error:", err);
    return null;
  } finally {
    setUploading?.(false);
  }
};
