import React, { useState, useRef } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Modal from "react-modal";
import { FiX, FiRotateCw, FiZoomIn, FiCheck } from "react-icons/fi";

Modal.setAppElement("#root");

const ImageCropper = ({ isOpen, onClose, onCropComplete, aspect = 1 }) => {
  const [src, setSrc] = useState(null);
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({
    unit: "%",
    width: 50,
    aspect,
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setSrc(reader.result);
        setCrop({ unit: "%", width: 50, aspect });
      });
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = (img) => {
    setImage(img);
    // Set initial crop to cover the image
    const minDimension = Math.min(img.width, img.height);
    setCrop({
      unit: "px",
      width: minDimension,
      height: minDimension,
      x: (img.width - minDimension) / 2,
      y: (img.height - minDimension) / 2,
    });
  };

  const getCroppedImg = (image, crop, fileName) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Canvas is empty");
            return;
          }
          blob.name = fileName;
          resolve(blob);
        },
        "image/jpeg",
        0.9
      );
    });
  };

  const handleCropComplete = async () => {
    if (image && completedCrop?.width && completedCrop?.height) {
      try {
        const croppedImageBlob = await getCroppedImg(
          image,
          completedCrop,
          "profile-picture.jpg"
        );

        // Create object URL for preview
        const croppedImageUrl = URL.createObjectURL(croppedImageBlob);

        onCropComplete(croppedImageUrl, croppedImageBlob);
        handleClose();
      } catch (error) {
        console.error("Error cropping image:", error);
      }
    }
  };

  const handleClose = () => {
    setSrc(null);
    setImage(null);
    setCrop({ unit: "%", width: 50, aspect });
    setCompletedCrop(null);
    onClose();
  };

  const rotateImage = () => {
    if (imgRef.current) {
      const currentRotation =
        parseInt(
          imgRef.current.style.transform
            .replace("rotate(", "")
            .replace("deg)", "")
        ) || 0;
      imgRef.current.style.transform = `rotate(${currentRotation + 90}deg)`;
    }
  };

  const zoomIn = () => {
    setCrop((prev) => ({
      ...prev,
      width: Math.max(10, prev.width - 10),
    }));
  };

  const zoomOut = () => {
    setCrop((prev) => ({
      ...prev,
      width: Math.min(100, prev.width + 10),
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="fixed inset-0 flex items-center justify-center z-50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75 z-40"
    >
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl mx-4 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Crop Profile Picture</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {!src ? (
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="text-gray-400 mb-4">
              <FiZoomIn className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-300 mb-4">Select an image to crop</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Choose Image
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-center">
              <ReactCrop
                crop={crop}
                onChange={(newCrop) => setCrop(newCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                circularCrop
                className="max-h-96"
              >
                <img
                  ref={imgRef}
                  src={src}
                  onLoad={(e) => onImageLoad(e.currentTarget)}
                  alt="Crop preview"
                  style={{ transform: "rotate(0deg)" }}
                />
              </ReactCrop>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={rotateImage}
                  className="p-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                  title="Rotate"
                >
                  <FiRotateCw className="w-5 h-5" />
                </button>
                <button
                  onClick={zoomIn}
                  className="p-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                  title="Zoom In"
                >
                  <FiZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  Change Image
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-700 rounded-lg text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropComplete}
                  className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition-colors flex items-center gap-2"
                  disabled={!completedCrop}
                >
                  <FiCheck className="w-4 h-4" />
                  Apply Crop
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ImageCropper;
