import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import PropTypes from 'prop-types';

function QuestionStep({ question, onYesClick, onNoAttempt, yesGrowthFactor }) {
  const noButtonRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [isFixed, setIsFixed] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const isFleeingRef = useRef(false);
  const lastTouchTime = useRef(0);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Reset button position when question changes
  useEffect(() => {
    setIsFixed(false);
    setButtonPosition({ x: 0, y: 0 });
    x.set(0);
    y.set(0);
    isFleeingRef.current = false;
  }, [question.id, x, y]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Enter or Space = Yes button
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onYesClick();
      }
      // Escape = No button (for accessibility testing)
      // Note: In production, you might want to disable this since No button is supposed to be hard to click
      if (e.key === 'Escape') {
        e.preventDefault();
        const noButton = noButtonRef.current;
        if (noButton && !isMobile) {
          handleMouseEnter({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onYesClick, isMobile]);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(isMobileDevice || isTouchDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track cursor position globally (desktop)
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  // Track touch position globally (mobile)
  useEffect(() => {
    if (!isMobile) return;

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        setTouchPosition({ x: touch.clientX, y: touch.clientY });
      }
    };

    const handleTouchStart = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        setTouchPosition({ x: touch.clientX, y: touch.clientY });
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isMobile]);

  // Check if cursor is close to button and make it run away (DESKTOP)
  useEffect(() => {
    if (isMobile) return;

    const checkCursorProximity = () => {
      const noButton = noButtonRef.current;
      if (!noButton || isFleeingRef.current) return;

      const rect = noButton.getBoundingClientRect();
      const buttonCenterX = rect.left + rect.width / 2;
      const buttonCenterY = rect.top + rect.height / 2;

      // Calculate distance from cursor to button center
      const distance = Math.sqrt(
        Math.pow(cursorPosition.x - buttonCenterX, 2) +
        Math.pow(cursorPosition.y - buttonCenterY, 2)
      );

      // Flee when cursor is within 150px of button
      const fleeDistance = 150;
      
      if (distance < fleeDistance && distance > 0) {
        isFleeingRef.current = true;
        onNoAttempt();
        
        const trapped = isInCorner(rect);
        let newPos = trapped ? getRandomPosition(rect) : getSafePosition(rect, cursorPosition.x, cursorPosition.y);

        setIsFixed(true);
        setButtonPosition(newPos);

        animate(x, newPos.x, {
          type: "spring",
          stiffness: 200,
          damping: 15,
          mass: 0.2,
          duration: 0.25,
          onComplete: () => {
            setTimeout(() => {
              isFleeingRef.current = false;
            }, 50);
          }
        });

        animate(y, newPos.y, {
          type: "spring",
          stiffness: 200,
          damping: 15,
          mass: 0.2,
          duration: 0.25
        });
      }
    };

    const proximityInterval = setInterval(checkCursorProximity, 20);
    return () => clearInterval(proximityInterval);
  }, [cursorPosition, isMobile, onNoAttempt, x, y]);

  // Check if touch is close to button and make it run away (MOBILE)
  useEffect(() => {
    if (!isMobile) return;

    const checkTouchProximity = () => {
      const noButton = noButtonRef.current;
      if (!noButton || isFleeingRef.current) return;

      const rect = noButton.getBoundingClientRect();
      const buttonCenterX = rect.left + rect.width / 2;
      const buttonCenterY = rect.top + rect.height / 2;

      // Calculate distance from touch to button center
      const distance = Math.sqrt(
        Math.pow(touchPosition.x - buttonCenterX, 2) +
        Math.pow(touchPosition.y - buttonCenterY, 2)
      );

      // Larger flee distance on mobile for easier interaction
      const fleeDistance = 100;
      
      if (distance < fleeDistance && distance > 0 && touchPosition.x !== 0) {
        isFleeingRef.current = true;
        onNoAttempt();
        
        const trapped = isInCorner(rect);
        let newPos = trapped ? getRandomPosition(rect) : getSafePosition(rect, touchPosition.x, touchPosition.y);

        setIsFixed(true);
        setButtonPosition(newPos);

        // Mobile-optimized animation
        animate(x, newPos.x, {
          type: "spring",
          stiffness: 180,
          damping: 15,
          mass: 0.25,
          duration: 0.3,
          onComplete: () => {
            setTimeout(() => {
              isFleeingRef.current = false;
            }, 100);
          }
        });

        animate(y, newPos.y, {
          type: "spring",
          stiffness: 180,
          damping: 15,
          mass: 0.25,
          duration: 0.3
        });

        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(30);
        }
      }
    };

    const proximityInterval = setInterval(checkTouchProximity, 30);
    return () => clearInterval(proximityInterval);
  }, [touchPosition, isMobile, onNoAttempt, x, y]);

  // Get completely random position within viewport (no directional bias)
  const getRandomPosition = (currentRect) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const buttonWidth = currentRect.width;
    const buttonHeight = currentRect.height;
    const padding = 50;

    // Completely random position anywhere in viewport
    const newX = padding + Math.random() * (viewportWidth - buttonWidth - padding * 2);
    const newY = padding + Math.random() * (viewportHeight - buttonHeight - padding * 2);

    return { x: newX, y: newY };
  };

  // Get safe position away from cursor with true random direction
  const getSafePosition = (currentRect, cursorX, cursorY) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const buttonWidth = currentRect.width;
    const buttonHeight = currentRect.height;
    const padding = 50;
    const minRunDistance = 120;
    const maxRunDistance = 200;

    const btnCenterX = currentRect.left + buttonWidth / 2;
    const btnCenterY = currentRect.top + buttonHeight / 2;

    // Calculate direction away from cursor
    const dx = btnCenterX - cursorX;
    const dy = btnCenterY - cursorY;
    let angle = Math.atan2(dy, dx);

    // Add LARGE random variation (-90° to +90° from escape angle)
    // This allows button to go left, right, up, down - anywhere!
    const randomVariation = (Math.random() - 0.5) * Math.PI; // ±90 degrees
    angle = angle + randomVariation;

    // Random distance
    const runDistance = minRunDistance + Math.random() * (maxRunDistance - minRunDistance);

    // Calculate new position
    let newX = btnCenterX + Math.cos(angle) * runDistance;
    let newY = btnCenterY + Math.sin(angle) * runDistance;

    // Ensure within viewport
    newX = Math.max(padding, Math.min(newX - buttonWidth / 2, viewportWidth - buttonWidth - padding));
    newY = Math.max(padding, Math.min(newY - buttonHeight / 2, viewportHeight - buttonHeight - padding));

    return { x: newX, y: newY };
  };

  // Check if button is out of viewport
  const isOutOfViewport = (rect) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const threshold = 10; // Small buffer
    
    return (
      rect.left < -threshold ||
      rect.right > viewportWidth + threshold ||
      rect.top < -threshold ||
      rect.bottom > viewportHeight + threshold
    );
  };

  // Bring button back SUPER FAST to viewport center
  const bringBackToViewport = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const noButton = noButtonRef.current;
    
    if (!noButton) return;
    
    const rect = noButton.getBoundingClientRect();
    const buttonWidth = rect.width;
    const buttonHeight = rect.height;

    // Random position in center 60% of screen
    const newPos = {
      x: viewportWidth * 0.2 + Math.random() * (viewportWidth * 0.6 - buttonWidth),
      y: viewportHeight * 0.2 + Math.random() * (viewportHeight * 0.6 - buttonHeight)
    };

    setIsFixed(true);
    setButtonPosition(newPos);

    // SUPER FAST instant snap back
    animate(x, newPos.x, {
      type: "spring",
      stiffness: 250,    // Very high = instant
      damping: 15,       // Snappy
      duration: 0.2      // Super quick
    });

    animate(y, newPos.y, {
      type: "spring",
      stiffness: 250,
      damping: 15,
      duration: 0.2
    });
  };

  // Check if button is out of viewport frequently
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const noButton = noButtonRef.current;
      if (!noButton || !isFixed) return;

      const rect = noButton.getBoundingClientRect();
      if (isOutOfViewport(rect)) {
        bringBackToViewport();
      }
    }, 500); // Check every 0.5s (faster detection)

    return () => clearInterval(checkInterval);
  }, [isFixed]);

  // Check if button is in corner (trapped)
  const isInCorner = (buttonRect) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const cornerThreshold = 100;

    const nearLeft = buttonRect.left < cornerThreshold;
    const nearRight = buttonRect.right > viewportWidth - cornerThreshold;
    const nearTop = buttonRect.top < cornerThreshold;
    const nearBottom = buttonRect.bottom > viewportHeight - cornerThreshold;

    return (nearLeft || nearRight) && (nearTop || nearBottom);
  };

  // Desktop: Run ONLY on hover (backup trigger)
  const handleMouseEnter = (e) => {
    if (isMobile) return;
    
    const noButton = noButtonRef.current;
    if (!noButton) return;

    onNoAttempt();
    
    const rect = noButton.getBoundingClientRect();
    const cursorX = e.clientX;
    const cursorY = e.clientY;

    // Check if trapped in corner
    const trapped = isInCorner(rect);
    
    let newPos;
    if (trapped) {
      // Emergency: jump to completely random location
      newPos = getRandomPosition(rect);
    } else {
      // Normal: escape with random direction
      newPos = getSafePosition(rect, cursorX, cursorY);
    }

    setIsFixed(true);
    setButtonPosition(newPos);

    // MUCH FASTER animation
    animate(x, newPos.x, {
      type: "spring",
      stiffness: 200,    // Very fast
      damping: 15,       // Snappy
      mass: 0.2,         // Light
      duration: 0.25     // Quick!
    });

    animate(y, newPos.y, {
      type: "spring",
      stiffness: 200,
      damping: 15,
      mass: 0.2,
      duration: 0.25
    });
  };

  // Desktop: Also run on click attempt
  const handleClick = (e) => {
    e.preventDefault();
    handleMouseEnter(e);
  };

  // Mobile: Enhanced touch handler
  const handleTouchStart = (e) => {
    if (!isMobile) return;
    
    // Prevent default but allow event to continue
    e.preventDefault();
    e.stopPropagation();
    
    const noButton = noButtonRef.current;
    if (!noButton || isFleeingRef.current) return;

    // Debounce rapid touches
    const now = Date.now();
    if (now - lastTouchTime.current < 200) return;
    lastTouchTime.current = now;

    onNoAttempt();

    const touch = e.touches[0];
    const rect = noButton.getBoundingClientRect();
    
    // Check if trapped
    const trapped = isInCorner(rect);
    
    let newPos;
    if (trapped) {
      // Random position anywhere
      newPos = getRandomPosition(rect);
    } else {
      // Escape with random direction
      newPos = getSafePosition(rect, touch.clientX, touch.clientY);
    }

    setIsFixed(true);
    setButtonPosition(newPos);

    // SUPER FAST mobile animation
    animate(x, newPos.x, {
      type: "spring",
      stiffness: 180,
      damping: 15,
      mass: 0.25,
      duration: 0.3
    });

    animate(y, newPos.y, {
      type: "spring",
      stiffness: 180,
      damping: 15,
      mass: 0.25,
      duration: 0.3
    });

    // Haptic feedback with pattern
    if ('vibrate' in navigator) {
      navigator.vibrate([20, 10, 20]); // Triple pulse
    }
  };

  return (
    <div className="flex-column text-center fade-in" role="form" aria-label="Valentine's Day Question">
      <h2 style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }} id="question-text">
        {question.text}
      </h2>
      
      {/* Hint text to encourage clicking No button */}
      {!isFixed && (
        <p style={{ 
          fontSize: '0.9rem', 
          color: 'var(--sys-text-secondary)', 
          fontStyle: 'italic',
          marginTop: '0.5rem',
          opacity: 0.7
        }}
        aria-live="polite">
          Psst... Try clicking that button on top! 😏
        </p>
      )}
      
      {isFixed && yesGrowthFactor > 1.3 && (
        <p style={{ 
          fontSize: '0.9rem', 
          color: 'var(--sys-accent)', 
          fontWeight: '600',
          marginTop: '0.5rem',
          animation: 'pulse 2s infinite'
        }}
        aria-live="polite">
          Hehe, giving up yet? The Yes button is getting bigger! 😄
        </p>
      )}
      
      <div className="flex-center mt-lg" style={{ position: 'relative', minHeight: '80px' }}>
        <button
          className="btn-primary btn-yes"
          onClick={onYesClick}
          style={{
            transform: `scale(${yesGrowthFactor})`,
            transition: 'transform 0.4s ease',
            position: 'relative',
            zIndex: 1,
          }}
          aria-label={`Answer yes: ${question.yesText}`}
          aria-describedby="question-text"
          tabIndex={0}
        >
          {question.yesText}
        </button>
        
        <motion.button
          ref={noButtonRef}
          className={`btn-secondary ${isFixed ? 'btn-no-escaped' : 'btn-no'}`}
          onMouseEnter={handleMouseEnter}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          style={{
            position: isFixed ? 'fixed' : 'absolute',
            left: isFixed ? 0 : '50%',
            top: isFixed ? 0 : '50%',
            transform: isFixed ? 'none' : 'translate(-50%, -50%)',
            x: isFixed ? x : 0,
            y: isFixed ? y : 0,
            cursor: 'pointer',
            zIndex: 10,
            animation: isFixed ? 'none' : undefined,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25
          }}
          aria-label={`Answer no: ${question.noText} (This button moves away when you try to click it)`}
          aria-describedby="question-text"
          tabIndex={-1}
        >
          {question.noText}
        </motion.button>
      </div>
    </div>
  );
}

QuestionStep.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    yesText: PropTypes.string.isRequired,
    noText: PropTypes.string.isRequired,
  }).isRequired,
  onYesClick: PropTypes.func.isRequired,
  onNoAttempt: PropTypes.func.isRequired,
  yesGrowthFactor: PropTypes.number.isRequired,
};

export default QuestionStep;
