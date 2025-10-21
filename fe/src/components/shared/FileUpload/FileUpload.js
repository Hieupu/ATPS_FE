import React, { useState, useRef } from "react";
import "./FileUpload.css";

const FileUpload = ({ onUpload, accept, maxSize, multiple = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = async (files) => {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (validateFile(file)) {
        await uploadFile(file);
      }
    }
  };

  const validateFile = (file) => {
    // File size validation
    if (maxSize && file.size > maxSize) {
      alert(
        `File ${file.name} quá lớn. Kích thước tối đa: ${
          maxSize / (1024 * 1024)
        }MB`
      );
      return false;
    }

    // File type validation
    if (
      accept &&
      !accept.split(",").some((type) => file.type.includes(type.trim()))
    ) {
      alert(
        `File ${file.name} không được hỗ trợ. Định dạng cho phép: ${accept}`
      );
      return false;
    }

    return true;
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setProgress(0);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      await onUpload(file);

      setProgress(100);
      setTimeout(() => {
        setProgress(0);
        setUploading(false);
      }, 500);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploading(false);
      setProgress(0);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="file-upload">
      <div
        className={`upload-area ${dragActive ? "drag-active" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          style={{ display: "none" }}
        />

        {uploading ? (
          <div className="upload-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p>Đang upload... {progress}%</p>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">📁</div>
            <p>Kéo thả file vào đây hoặc click để chọn</p>
            <p className="upload-hint">
              {accept && `Định dạng: ${accept}`}
              {maxSize && ` | Kích thước tối đa: ${maxSize / (1024 * 1024)}MB`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;






