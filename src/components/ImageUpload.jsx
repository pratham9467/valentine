import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import './ImageUpload.css';

function ImageUpload({ onImagesChange, maxImages = 3 }) {
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to maxImages
    const remainingSlots = maxImages - images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    if (filesToAdd.length === 0) return;

    // Validate file types and sizes
    const validFiles = filesToAdd.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isUnder5MB = file.size <= 5 * 1024 * 1024; // 5MB limit
      
      if (!isImage) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      if (!isUnder5MB) {
        alert(`${file.name} is larger than 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Create preview URLs
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    
    const updatedImages = [...images, ...validFiles];
    const updatedPreviews = [...previews, ...newPreviews];

    setImages(updatedImages);
    setPreviews(updatedPreviews);
    onImagesChange(updatedImages);

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    // Revoke preview URL to free memory
    URL.revokeObjectURL(previews[index]);

    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);

    setImages(updatedImages);
    setPreviews(updatedPreviews);
    onImagesChange(updatedImages);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-upload-container">
      <h3 className="upload-title">
        Upload Your Special Moments 📸
      </h3>
      <p className="upload-subtitle">
        Add up to {maxImages} photos that capture your favorite memories together
      </p>

      <div className="image-grid">
        <AnimatePresence mode="popLayout">
          {previews.map((preview, index) => (
            <motion.div
              key={preview}
              className="image-preview-card"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <img src={preview} alt={`Moment ${index + 1}`} />
              <button
                className="remove-image-btn"
                onClick={() => removeImage(index)}
                aria-label="Remove image"
              >
                ×
              </button>
              <div className="image-number">{index + 1}</div>
            </motion.div>
          ))}

          {images.length < maxImages && (
            <motion.div
              className="upload-placeholder"
              onClick={handleClick}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="upload-icon">+</div>
              <p>Add Photo</p>
              <span className="upload-hint">
                {images.length === 0 ? 'Click to upload' : `${maxImages - images.length} remaining`}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <div className="upload-info">
        <p>
          ℹ️ Images should be under 5MB each • Supported formats: JPG, PNG, GIF, WebP
        </p>
      </div>
    </div>
  );
}

ImageUpload.propTypes = {
  onImagesChange: PropTypes.func.isRequired,
  maxImages: PropTypes.number,
};

export default ImageUpload;
