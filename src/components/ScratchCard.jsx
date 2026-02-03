import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import './ScratchCard.css';

function ScratchCard({ isOpen, onClose, coupleImage }) {
  const canvasRef = useRef(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercentage, setScratchPercentage] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setImageLoaded(false);
      setImageError(false);
      setIsRevealed(false);
      setScratchPercentage(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !imageLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    // Set canvas size
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Create scratch overlay (silver/gray coating)
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add texture pattern
    ctx.fillStyle = '#D3D3D3';
    for (let i = 0; i < canvas.width; i += 4) {
      for (let j = 0; j < canvas.height; j += 4) {
        if (Math.random() > 0.5) {
          ctx.fillRect(i, j, 2, 2);
        }
      }
    }

    // Add text overlay
    ctx.fillStyle = '#888888';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Scratch to reveal', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '18px Arial';
    ctx.fillText('your special moment! 💕', canvas.width / 2, canvas.height / 2 + 20);
  }, [isOpen, imageLoaded]);

  const scratch = (x, y) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    // Convert to canvas coordinates with proper scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = (x - rect.left) * scaleX;
    const canvasY = (y - rect.top) * scaleY;

    // Scratch effect with larger radius on mobile
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    const scratchRadius = window.innerWidth < 768 ? 40 : 30; // Larger on mobile
    ctx.arc(canvasX, canvasY, scratchRadius, 0, Math.PI * 2);
    ctx.fill();

    // Calculate scratch percentage
    checkScratchPercentage();
  };

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    let transparentPixels = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) {
        transparentPixels++;
      }
    }

    const percentage = (transparentPixels / (pixels.length / 4)) * 100;
    setScratchPercentage(percentage);

    // If 70% scratched, reveal the image
    if (percentage > 70 && !isRevealed) {
      setIsRevealed(true);
      // Fade out the canvas
      setTimeout(() => {
        canvas.style.opacity = '0';
      }, 300);
    }
  };

  const handleMouseDown = (e) => {
    setIsScratching(true);
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    if (!isScratching) return;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setIsScratching(false);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    setIsScratching(true);
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
    
    // Haptic feedback on start
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleTouchMove = (e) => {
    if (!isScratching) return;
    e.preventDefault();
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    setIsScratching(false);
  };

  // Keyboard navigation support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e) => {
      // Escape or Enter to close modal
      if (e.key === 'Escape' || (e.key === 'Enter' && isRevealed)) {
        e.preventDefault();
        onClose();
      }
      // Space to skip scratching (accessibility feature)
      if (e.key === ' ' && !isRevealed) {
        e.preventDefault();
        setIsRevealed(true);
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.style.opacity = '0';
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, isRevealed, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="scratch-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scratch-card-title"
      >
        <motion.div
          className="scratch-modal-content"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="scratch-close-btn" 
            onClick={onClose}
            aria-label="Close scratch card"
            tabIndex={0}
          >
            ✕
          </button>

          <h2 className="scratch-title" id="scratch-card-title">
            {isRevealed ? '💕 Our Special Moment 💕' : '🎁 A Special Surprise! 🎁'}
          </h2>

          <div className="scratch-card-container">
            <div className="scratch-image-wrapper">
              {/* Loading spinner */}
              {!imageLoaded && !imageError && (
                <div className="image-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading your special moment... 💕</p>
                </div>
              )}

              {/* Background couple image */}
              <img
                src={coupleImage || '/couple-photo.jpg'}
                alt="Couple"
                className="couple-image"
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  setImageError(true);
                  setImageLoaded(true);
                  e.target.src = 'https://via.placeholder.com/400x500/FFB6C1/FFFFFF?text=Your+Special+Photo+%F0%9F%92%95';
                }}
                style={{ opacity: imageLoaded ? 1 : 0 }}
              />

              {/* Scratch canvas overlay */}
              <canvas
                ref={canvasRef}
                className="scratch-canvas"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                  transition: 'opacity 0.5s ease',
                  cursor: isScratching ? 'grabbing' : 'grab'
                }}
              />
            </div>

            {!isRevealed && (
              <p className="scratch-hint">
                {scratchPercentage > 0
                  ? `${Math.floor(scratchPercentage)}% revealed... Keep scratching! ✨`
                  : 'Use your finger or mouse to scratch! (Press Space to skip) 👆'}
              </p>
            )}

            {isRevealed && (
              <motion.div
                className="revealed-message"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="revealed-text">
                  This is us... and this is forever! ❤️
                </p>
                <button 
                  className="btn-primary" 
                  onClick={onClose}
                  aria-label="Continue to next question"
                  tabIndex={0}
                  autoFocus
                >
                  Continue 💕
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

ScratchCard.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  coupleImage: PropTypes.string,
};

export default ScratchCard;
