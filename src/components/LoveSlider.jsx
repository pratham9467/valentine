import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import './LoveSlider.css';

// [rendering-hoist-jsx] Extract static JSX outside component
const STATIC_HEADER = <h2>Wait! Let me show you something... 💕</h2>;
const STATIC_SUBTITLE = (
  <p className="love-slider-subtitle">
    Move the slider to see how much I care about you! 👇
  </p>
);

// [rerender-memo-with-default-value] Hoist default values
const CONFETTI_COLORS = ['#F5AFAF', '#E89999', '#FF6B9D', '#FFB6C1', '#FFC0CB', '#FF69B4'];

function LoveSlider({ onMaxReached }) {
  const [value, setValue] = useState(100);
  const [isFalling, setIsFalling] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const sliderRef = useRef(null);
  const staticBallRef = useRef(null);
  const fallingBallRef = useRef(null);

  // [rerender-derived-state] Derive state during render, not effects
  const percentage = (value / 10000) * 100;
  const isMaxReached = value >= 10000;

  const getMessage = useCallback((val) => {
    // [js-early-exit] Return early from functions
    if (val >= 10000) return "YES! That's it! My heart is overflowing! 😍💝✨";
    if (val >= 5000) return "Getting there... You're making me blush! 😊💘";
    if (val >= 2000) return "Keep going! There's more! ❤️✨";
    if (val >= 1000) return "That's nice, but I know you can go higher! 💕";
    return "Hmm... That's it? Try moving it more! 💕";
  }, []);

  // [rerender-simple-expression-in-memo] Only memo complex calculations
  const currentMessage = getMessage(value);
  
  // [rerender-derived-state-no-effect] Calculate during render
  const ballPosition = `calc(${percentage}% - 20px)`;
  const fillWidth = `${percentage}%`;

  useEffect(() => {
    // [rerender-move-effect-to-event] Only use effect for side effects, not logic
    if (isMaxReached && !isFalling) {
      // Trigger the falling animation
      setIsFalling(true);
      
      // Wait for the falling ball to render, then animate it
      setTimeout(() => {
        const fallingBall = fallingBallRef.current;
        const staticBall = staticBallRef.current;
        
        if (!fallingBall) return;

        // [js-cache-property-access] Cache property access
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const staticBallRect = staticBall ? staticBall.getBoundingClientRect() : fallingBall.getBoundingClientRect();
        const driftX = (Math.random() - 0.5) * 300;
        const rotation = 720 + Math.random() * 360;
        
        // Set initial position to match where the ball was
        gsap.set(fallingBall, {
          position: 'fixed',
          left: staticBallRect.left,
          top: staticBallRect.top,
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1
        });
        
        // Animate ball falling off with physics
        gsap.to(fallingBall, {
          y: viewportHeight - staticBallRect.top + 200,
          x: driftX,
          rotation: rotation,
          scale: 0.3,
          opacity: 0.8,
          duration: 2.5,
          ease: 'power2.in',
          onComplete: () => {
            setTimeout(() => {
              setShowContinue(true);
            }, 300);
          }
        });

        // Confetti explosion when it starts falling
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { 
            x: staticBallRect.left / viewportWidth,
            y: staticBallRect.top / viewportHeight
          },
          colors: CONFETTI_COLORS,
          startVelocity: 45,
          gravity: 1.2
        });
        
        // Additional confetti burst mid-fall
        setTimeout(() => {
          confetti({
            particleCount: 80,
            spread: 100,
            origin: { y: 0.7 },
            colors: CONFETTI_COLORS,
            startVelocity: 30
          });
        }, 800);
      }, 50);
    }
  }, [isMaxReached, isFalling]);

  // [rerender-functional-setstate] Use functional setState for stable callbacks
  const handleSliderChange = useCallback((e) => {
    if (isFalling) return; // [js-early-exit] Return early
    setValue(parseInt(e.target.value, 10));
  }, [isFalling]);

  // [rerender-move-effect-to-event] Move interaction logic to event handlers
  const handleContinue = useCallback(() => {
    gsap.to('.love-slider-container', {
      scale: 0.9,
      opacity: 0,
      duration: 0.3,
      onComplete: onMaxReached
    });
  }, [onMaxReached]);

  return (
    <div className="love-slider-container">
      {STATIC_HEADER}
      {STATIC_SUBTITLE}

      <div className="love-slider-wrapper" ref={sliderRef}>
        <p className="love-percentage">
          This much? 🥺 ({value}%)
        </p>

        <div className="slider-track-container">
          {/* Custom slider track */}
          <div className="slider-track">
            <div 
              className="slider-fill" 
              style={{ 
                width: fillWidth,
                willChange: 'width'
              }}
            />
          </div>

          {/* Custom slider ball */}
          {!isFalling && (
            <div
              ref={staticBallRef}
              className="slider-ball"
              style={{
                left: ballPosition,
                willChange: 'left'
              }}
            >
              ❤️
            </div>
          )}

          {/* Falling ball (separate element for animation) */}
          {isFalling && (
            <div
              ref={fallingBallRef}
              className="slider-ball falling"
            >
              ❤️
            </div>
          )}

          {/* Hidden input for functionality */}
          <input
            type="range"
            min="0"
            max="10000"
            value={value}
            onChange={handleSliderChange}
            className="slider-input"
            disabled={isFalling}
          />
        </div>

        {/* [rendering-conditional-render] Use ternary, not && */}
        {!isFalling ? (
          <motion.p 
            className="love-message"
            key={currentMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentMessage}
          </motion.p>
        ) : null}

        {/* Falling message */}
        {isFalling && !showContinue ? (
          <motion.p
            className="falling-message"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            😱 Oh no! Your love is too much! The slider can't contain it! 💕
          </motion.p>
        ) : null}

        {/* Continue button */}
        {showContinue ? (
          <motion.button
            className="btn-primary"
            onClick={handleContinue}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Aww, that's sweet! Continue 💝
          </motion.button>
        ) : null}
      </div>
    </div>
  );
}

LoveSlider.propTypes = {
  onMaxReached: PropTypes.func.isRequired,
};

export default LoveSlider;
