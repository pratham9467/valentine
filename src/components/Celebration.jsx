import { useEffect } from 'react';
import PropTypes from 'prop-types';
import confetti from 'canvas-confetti';
import gsap from 'gsap';

function Celebration({ partnerName = 'My Love' }) {
  const handleReset = () => {
    if (confirm('Do you want to start over with a new name?')) {
      localStorage.removeItem('valentinePartnerName');
      window.location.reload();
    }
  };
  useEffect(() => {
    // Animate the celebration card entry
    gsap.fromTo('.celebration-card',
      { scale: 0.5, opacity: 0, rotation: -15 },
      { 
        scale: 1, 
        opacity: 1, 
        rotation: 0,
        duration: 0.8, 
        ease: 'back.out(1.7)' 
      }
    );

    // Heart explosion with canvas-confetti
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = { 
      startVelocity: 30, 
      spread: 360, 
      ticks: 60, 
      zIndex: 9999,
      colors: ['#F5AFAF', '#E89999', '#FF6B9D', '#FFB6C1', '#FFC0CB', '#FF69B4']
    };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    // Continuous heart confetti
    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Emit from two sides
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        shapes: ['circle', 'square'],
        scalar: randomInRange(0.8, 1.4),
      });
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        shapes: ['circle', 'square'],
        scalar: randomInRange(0.8, 1.4),
      });
    }, 250);

    // Big celebration burst
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 180,
        origin: { y: 0.6 },
        colors: ['#F5AFAF', '#E89999', '#FF6B9D', '#FFB6C1', '#FFC0CB'],
        shapes: ['circle', 'square'],
        scalar: 1.2,
        gravity: 0.8,
      });
    }, 500);

    // Cleanup
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Create floating hearts manually
  useEffect(() => {
    const container = document.querySelector('.celebration-hearts');
    if (!container) return;

    const createHeart = () => {
      const heart = document.createElement('div');
      heart.className = 'celebration-heart';
      heart.innerHTML = ['❤️', '💖', '💝', '💗', '💓', '💕', '💘', '💞'][Math.floor(Math.random() * 8)];
      heart.style.left = Math.random() * 100 + 'vw';
      heart.style.fontSize = (Math.random() * 2 + 2) + 'rem';
      heart.style.animationDuration = (Math.random() * 3 + 3) + 's';
      heart.style.animationDelay = Math.random() * 2 + 's';
      
      container.appendChild(heart);
      
      setTimeout(() => heart.remove(), 8000);
    };

    // Create initial hearts
    for (let i = 0; i < 30; i++) {
      setTimeout(() => createHeart(), i * 100);
    }

    // Keep creating hearts
    const interval = setInterval(createHeart, 500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="celebration-hearts"></div>
      
      <div className="glass-card celebration-card text-center">
        <div className="celebration-emoji mb-lg">💕🎉✨</div>
        
        <h1 className="celebration-title mb-md">
          {partnerName} Said YES! 💝
        </h1>
        
        <div className="celebration-message">
          <p style={{ 
            fontSize: '1.3rem', 
            lineHeight: '2', 
            color: 'var(--sys-accent)', 
            marginBottom: 'var(--spacing-lg)',
            fontWeight: '600'
          }}>
            Thank you meri zindagi ka hissa banne ke liye ❤️
          </p>
          
          <p style={{ 
            fontSize: '1.15rem', 
            lineHeight: '1.9', 
            color: 'var(--sys-text-primary)',
            marginBottom: 'var(--spacing-md)',
            fontStyle: 'italic'
          }}>
            Mai perfect nahi hu,<br />
            par <strong>tere liye better banne ki</strong><br />
            <strong style={{ color: 'var(--sys-accent)' }}>poori koshish karunga.</strong> 💪✨
          </p>
          
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 175, 175, 0.2), rgba(232, 153, 153, 0.2))',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)',
            marginTop: 'var(--spacing-lg)',
            border: '2px solid var(--sys-accent)'
          }}>
            <p style={{ 
              fontSize: '1.1rem', 
              lineHeight: '1.8', 
              color: 'var(--sys-text-secondary)',
              marginBottom: '0.5rem'
            }}>
              Valentine sirf ek din ka nahi...
            </p>
            <p style={{ 
              fontSize: '1.4rem', 
              lineHeight: '1.8', 
              fontWeight: '700',
              background: 'linear-gradient(135deg, #FF1493, #FF69B4)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginTop: '0.5rem'
            }}>
              Tu meri har din ki Valentine hai 🫶🌹
            </p>
          </div>
          
          <p style={{
            fontSize: '1rem',
            color: 'var(--sys-text-secondary)',
            fontStyle: 'italic',
            marginTop: 'var(--spacing-lg)',
            opacity: 0.8
          }}>
            Forever & always, my love 💖
          </p>
        </div>
        
        <div className="celebration-emojis mt-lg">
          🎁💖🤗💝💋❤️💕🌹✨🎊🎉🎈🌟💎👑💘🔥🌈🎆🌺🦋🎀💞
        </div>

        <button 
          onClick={handleReset}
          style={{
            marginTop: 'var(--spacing-lg)',
            background: 'rgba(255, 255, 255, 0.5)',
            color: 'var(--sys-text-secondary)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(245, 175, 175, 0.3)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.5)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          🔄 Start Over
        </button>
      </div>

      <style>{`
        .celebration-hearts {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .celebration-heart {
          position: absolute;
          animation: floatUp linear forwards;
          opacity: 0.9;
        }

        @keyframes floatUp {
          0% {
            transform: translateY(100vh) rotate(0deg) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 0.9;
          }
          90% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(-100px) rotate(360deg) scale(1.5);
            opacity: 0;
          }
        }

        .celebration-card {
          position: relative;
          z-index: 10;
          animation: glow 2s ease-in-out infinite;
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 
              0 8px 32px 0 rgba(245, 175, 175, 0.15),
              0 2px 8px 0 rgba(0, 0, 0, 0.05);
          }
          50% {
            box-shadow: 
              0 12px 40px 0 rgba(245, 175, 175, 0.3),
              0 4px 12px 0 rgba(0, 0, 0, 0.1);
          }
        }

        .celebration-emoji {
          font-size: 5rem;
          animation: bounce 1s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.1);
          }
        }

        .celebration-title {
          animation: rainbow 3s ease-in-out infinite;
          font-size: clamp(2rem, 5vw, 3.5rem);
        }

        @keyframes rainbow {
          0%, 100% {
            background: linear-gradient(135deg, var(--sys-accent) 0%, #E89999 100%);
            -webkit-background-clip: text;
            background-clip: text;
          }
          50% {
            background: linear-gradient(135deg, #FF6B9D 0%, #F5AFAF 100%);
            -webkit-background-clip: text;
            background-clip: text;
          }
        }

        .celebration-emojis {
          font-size: 2rem;
          line-height: 1.8;
          animation: wave 2s ease-in-out infinite;
        }

        @keyframes wave {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </>
  );
}

Celebration.propTypes = {
  partnerName: PropTypes.string
};

export default Celebration;
