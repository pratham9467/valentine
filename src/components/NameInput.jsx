import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import gsap from 'gsap';
import './NameInput.css';

function NameInput({ onNameSubmit }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    gsap.fromTo('.name-input-card',
      { scale: 0.8, opacity: 0, y: 50 },
      { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' }
    );
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('Please enter a name! 💕');
      return;
    }
    
    if (trimmedName.length < 2) {
      setError('Name should be at least 2 characters! 😊');
      return;
    }
    
    if (trimmedName.length > 20) {
      setError('That name is too long! Keep it under 20 characters 🥺');
      return;
    }

    // Animate out before submitting
    gsap.to('.name-input-card', {
      scale: 0.9,
      opacity: 0,
      y: -30,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        onNameSubmit(trimmedName);
      }
    });
  };

  const handleInputChange = (e) => {
    setName(e.target.value);
    if (error) setError('');
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && name.trim()) {
        handleSubmit(e);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [name]);

  return (
    <div className="name-input-container">
      <motion.div 
        className="name-input-card glass-card"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="name-input-content">
          <h1 className="text-center" style={{ marginBottom: '1rem' }}>
            💝 Valentine&apos;s Day Special 💝
          </h1>
          
          <p className="name-input-subtitle">
            Before we begin this special journey... 🌹
          </p>

          <form onSubmit={handleSubmit} className="name-input-form">
            <label htmlFor="partner-name" className="name-input-label">
              What&apos;s your special someone&apos;s name?
            </label>
            
            <input
              id="partner-name"
              type="text"
              value={name}
              onChange={handleInputChange}
              placeholder="Enter their name... 💕"
              className="name-input-field"
              autoFocus
              autoComplete="off"
              maxLength={20}
              aria-label="Partner's name"
              aria-describedby={error ? 'name-error' : undefined}
              aria-invalid={error ? 'true' : 'false'}
            />

            {error && (
              <motion.p 
                id="name-error"
                className="name-input-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              className="btn-primary name-input-submit"
              disabled={!name.trim()}
              style={{
                opacity: name.trim() ? 1 : 0.6,
                cursor: name.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              Let&apos;s Begin! 💖
            </button>
          </form>

          <p className="name-input-hint">
            ✨ This will personalize your Valentine&apos;s experience ✨
          </p>
        </div>
      </motion.div>
    </div>
  );
}

NameInput.propTypes = {
  onNameSubmit: PropTypes.func.isRequired,
};

export default NameInput;
