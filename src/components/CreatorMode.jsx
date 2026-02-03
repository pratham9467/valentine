import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import ImageUpload from './ImageUpload';
import { createExperience } from '../lib/valentineService';
import './CreatorMode.css';

function CreatorMode({ onLinkGenerated }) {
  const [step, setStep] = useState(1); // 1: Names, 2: Images, 3: Link Generated
  const [partnerName, setPartnerName] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  const handleStep1Continue = (e) => {
    e.preventDefault();
    if (!partnerName.trim()) {
      setError('Please enter your partner\'s name');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleImagesChange = (newImages) => {
    setImages(newImages);
    setError('');
  };

  const handleGenerateLink = async () => {
    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const uniqueCode = await createExperience({
        partnerName: partnerName.trim(),
        creatorName: creatorName.trim() || null,
        images
      });

      const link = `${window.location.origin}/?v=${uniqueCode}`;
      setGeneratedLink(link);
      setStep(3);
      
      if (onLinkGenerated) {
        onLinkGenerated(link, uniqueCode);
      }
    } catch (err) {
      console.error('Error generating link:', err);
      setError('Failed to create your Valentine experience. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      alert('Link copied to clipboard! 📋');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = generatedLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard! 📋');
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Will you be my Valentine, ${partnerName}? 💕`,
          text: `${partnerName}, I have something special to ask you... 💝`,
          url: generatedLink
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(); // Fallback to copy
        }
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="creator-mode">
      <div className="creator-container">
        {/* Step 1: Enter Names */}
        {step === 1 && (
          <motion.div
            className="creator-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h1 className="creator-title">
              Create Your Valentine Surprise 💝
            </h1>
            <p className="creator-subtitle">
              Personalize a special Valentine's experience for someone you care about
            </p>

            <form onSubmit={handleStep1Continue} className="name-form">
              <div className="form-group">
                <label htmlFor="partnerName">Their Name *</label>
                <input
                  id="partnerName"
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="e.g., Sarah"
                  className="name-input"
                  autoFocus
                  maxLength={50}
                />
              </div>

              <div className="form-group">
                <label htmlFor="creatorName">Your Name (Optional)</label>
                <input
                  id="creatorName"
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="e.g., John"
                  className="name-input"
                  maxLength={50}
                />
              </div>

              {error && (
                <motion.p
                  className="error-message"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {error}
                </motion.p>
              )}

              <button type="submit" className="btn-primary btn-continue">
                Continue to Photos →
              </button>
            </form>
          </motion.div>
        )}

        {/* Step 2: Upload Images */}
        {step === 2 && (
          <motion.div
            className="creator-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <button
              className="back-button"
              onClick={() => setStep(1)}
            >
              ← Back
            </button>

            <h2 className="step-title">
              Add Photos for {partnerName} 📸
            </h2>

            <ImageUpload
              onImagesChange={handleImagesChange}
              maxImages={3}
            />

            {error && (
              <motion.p
                className="error-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.p>
            )}

            <button
              className="btn-primary btn-generate"
              onClick={handleGenerateLink}
              disabled={isLoading || images.length === 0}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Creating Your Link...
                </>
              ) : (
                <>
                  Generate Link ✨
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Step 3: Link Generated */}
        {step === 3 && (
          <motion.div
            className="creator-step link-generated"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="success-icon">🎉</div>
            <h2 className="success-title">
              Your Link is Ready!
            </h2>
            <p className="success-subtitle">
              Share this special link with {partnerName}
            </p>

            <div className="link-container">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="generated-link"
              />
            </div>

            <div className="action-buttons">
              <button
                className="btn-primary"
                onClick={shareLink}
              >
                Share Link 💕
              </button>
              <button
                className="btn-secondary"
                onClick={copyToClipboard}
              >
                Copy Link 📋
              </button>
            </div>

            <div className="info-box">
              <p>
                💡 <strong>Tip:</strong> Your personalized Valentine experience is now live!
                When {partnerName} opens the link, they'll see your photos and answer your questions.
              </p>
            </div>

            <button
              className="create-another"
              onClick={() => {
                setStep(1);
                setPartnerName('');
                setCreatorName('');
                setImages([]);
                setGeneratedLink('');
              }}
            >
              Create Another Experience
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

CreatorMode.propTypes = {
  onLinkGenerated: PropTypes.func,
};

export default CreatorMode;
