import { useState, useEffect } from 'react';
import gsap from 'gsap';
import QuestionStep from './components/QuestionStep';
import Celebration from './components/Celebration';
import ScratchCard from './components/ScratchCard';
import NameInput from './components/NameInput';
import LoveSlider from './components/LoveSlider';
import CreatorMode from './components/CreatorMode';
import { getExperience } from './lib/valentineService';
import './App.css';

// Import default couple images (fallback)
import img1 from './assets/img1.avif';
import img2 from './assets/img2.avif';
import img3 from './assets/img3.avif';

function App() {
  const [mode, setMode] = useState('loading'); // 'loading', 'creator', 'recipient'
  const [experienceData, setExperienceData] = useState(null);
  const [partnerName, setPartnerName] = useState('');
  const [currentStage, setCurrentStage] = useState(0);
  const [yesGrowthFactor, setYesGrowthFactor] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showScratchCard, setShowScratchCard] = useState(false);
  const [customImages, setCustomImages] = useState([img1, img2, img3]);

  // Check URL for unique code on mount
  useEffect(() => {
    const checkForExperience = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const uniqueCode = urlParams.get('v');

      if (uniqueCode) {
        // Recipient mode - load experience
        try {
          const data = await getExperience(uniqueCode);
          setExperienceData(data);
          setPartnerName(data.partner_name);
          setCustomImages(data.image_urls.length > 0 ? data.image_urls : [img1, img2, img3]);
          setMode('recipient');
        } catch (error) {
          console.error('Error loading experience:', error);
          alert('Invalid or expired Valentine link. Redirecting to creator mode...');
          setMode('creator');
          // Clean URL
          window.history.replaceState({}, document.title, '/');
        }
      } else {
        // No code - show creator mode
        setMode('creator');
      }
    };

    checkForExperience();
  }, []);

  // Load saved name from localStorage (only in creator mode)
  useEffect(() => {
    if (mode === 'creator') {
      const savedName = localStorage.getItem('valentinePartnerName');
      if (savedName) {
        setPartnerName(savedName);
      }
    }
  }, [mode]);

  // Handle name submission
  const handleNameSubmit = (name) => {
    setPartnerName(name);
    localStorage.setItem('valentinePartnerName', name);
  };

  // Map stages to images - use custom images from experience
  const getImageForStage = (stage) => {
    return customImages[stage % customImages.length];
  };

  // Questions data - Designed to tempt users to try the No button!
  const questions = [
    {
      id: 1,
      text: `Hey ${partnerName}! 👋\nDo you think I'm kinda cute? 🥺`,
      yesText: "Nope, not really 😏",
      noText: "Yes 💕"
    },
    {
      id: 2,
      text: "Okay okay, honest question... 🤔\nDo you ever think about me randomly? 💭",
      yesText: "Never, sorry 🙈",
      noText: "Sometimes 😊"
    },
    {
      id: 3,
      text: "I'll be honest with you... 😳\nI think you're absolutely amazing! Do you feel the same? ✨",
      yesText: "Definitely not 😝",
      noText: "Maybe 💗"
    },
    {
      id: 4,
      text: "Last serious question before the big one... 🌟\nCould you see us together? Like, for real? 👫",
      yesText: "Nah, just friends 🤷‍♀️",
      noText: "Yes ❤️"
    },
    {
      id: 5,
      text: `Alright ${partnerName}, moment of truth! 💝\nWill you be my Valentine? 🌹`,
      yesText: "YES! 💕",
      noText: "No way! 😈"
    }
  ];

  // Handle "Yes" button click
  const handleYesClick = () => {
    // Show scratch card modal for first 4 questions
    if (currentStage < 4) {
      setShowScratchCard(true);
      return;
    }

    // Animate transition for last question
    gsap.to('.glass-card', {
      scale: 0.95,
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        if (currentStage === 4) {
          // Last question - show celebration
          setShowCelebration(true);
        }
      }
    });
  };

  // Handle scratch card close - continue to next stage
  const handleScratchCardClose = () => {
    setShowScratchCard(false);

    // Animate transition
    gsap.to('.glass-card', {
      scale: 0.95,
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        // Reset Yes button growth for next question
        setYesGrowthFactor(1);
        
        if (currentStage === 2) {
          // After third question, show love meter
          setCurrentStage(currentStage + 1);
        } else {
          setCurrentStage(currentStage + 1);
        }

        gsap.fromTo('.glass-card',
          { scale: 1.05, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
        );
      }
    });
  };

  // Handle "No" button hover - increase Yes button size
  const handleNoAttempt = () => {
    setYesGrowthFactor(prev => Math.min(prev + 0.1, 2)); // Max 2x size
  };

  // Handle love meter next (when slider reaches max)
  const handleLoveMeterNext = () => {
    setCurrentStage(currentStage + 1);
    gsap.fromTo('.glass-card',
      { scale: 1.05, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
    );
  };

  // Preload images on component mount
  useEffect(() => {
    customImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [customImages]);

  // Animate card entry on mount
  useEffect(() => {
    gsap.fromTo('.glass-card',
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
    );
  }, []);

  // Render floating hearts in background
  useEffect(() => {
    const createFloatingHeart = () => {
      const heartsContainer = document.querySelector('.floating-hearts');
      if (!heartsContainer) return;

      const heart = document.createElement('div');
      heart.className = 'heart';
      heart.innerHTML = ['❤️', '💖', '💝', '💗', '💓', '💕'][Math.floor(Math.random() * 6)];
      heart.style.left = Math.random() * 100 + 'vw';
      heart.style.animationDelay = Math.random() * 5 + 's';
      heart.style.fontSize = (Math.random() * 1.5 + 1.5) + 'rem';

      heartsContainer.appendChild(heart);

      setTimeout(() => heart.remove(), 15000);
    };

    // Create initial hearts
    for (let i = 0; i < 10; i++) {
      setTimeout(() => createFloatingHeart(), i * 500);
    }

    // Keep creating hearts periodically
    const interval = setInterval(createFloatingHeart, 3000);

    return () => clearInterval(interval);
  }, []);

  // Loading state
  if (mode === 'loading') {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">💕</div>
        <p>Loading your Valentine experience...</p>
      </div>
    );
  }

  // Creator mode - show link generation interface
  if (mode === 'creator') {
    return <CreatorMode onLinkGenerated={() => console.log('Link generated!')} />;
  }

  // Recipient mode - show the Valentine experience
  if (showCelebration) {
    return <Celebration partnerName={partnerName} />;
  }

  // Show name input if no name is set (shouldn't happen in recipient mode)
  if (!partnerName) {
    return <NameInput onNameSubmit={handleNameSubmit} />;
  }

  return (
    <>
      <div className="floating-hearts"></div>

      <div className="glass-card fade-in">
        <h1 className="text-center mb-lg">
          {currentStage === 0 && `Hey ${partnerName}! 👋💕`}
          {currentStage === 1 && "Getting curious? 😊✨"}
          {currentStage === 2 && "One more thing... 💭"}
          {currentStage === 3 && "This is important! 💝"}
          {currentStage === 4 && "The Big Question! 🌹"}
        </h1>

        {currentStage < 5 && currentStage !== 3 && (
          <QuestionStep
            question={questions[currentStage]}
            onYesClick={handleYesClick}
            onNoAttempt={handleNoAttempt}
            yesGrowthFactor={yesGrowthFactor}
          />
        )}

        {/* Love Meter Stage (after 3rd question) */}
        {currentStage === 3 && (
          <LoveSlider onMaxReached={handleLoveMeterNext} />
        )}
      </div>

      {/* Scratch Card Modal */}
      <ScratchCard
        isOpen={showScratchCard}
        onClose={handleScratchCardClose}
        coupleImage={getImageForStage(currentStage)}
      />
    </>
  );
}

export default App;
