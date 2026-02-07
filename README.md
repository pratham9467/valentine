# 💝Valentine - Premium React Valentine's Day Website

A sophisticated, interactive Valentine's Day proposal website built with React, GSAP, and modern glassmorphism design. Created with love for Yeshu.

## ✨ Features

### 🎨 Premium Design System
- **Glassmorphism UI**: Elegant frosted glass effect with backdrop blur
- **Color Palette**: Soft, romantic Blushing Rose theme
  - Background: `#FCF8F8` (Soft Blush)
  - Surface: `#FBEFEF` / `#F9DFDF` (Layered Light)
  - Accent: `#F5AFAF` (Blushing Rose)
- **Typography**: Dancing Script for headings, Poppins for body text
- **Responsive**: Fully optimized for mobile, tablet, and desktop

### 🎮 Interactive Features
- **Smart "No" Button Evasion**:
  - **Desktop**: Button flees from cursor using proximity detection (150px escape radius)
  - **Mobile**: Button jumps to random location on tap
  - Uses GSAP for smooth, physics-based animations
  
- **"Yes" Button Growth**: Each "No" attempt makes the "Yes" button grow larger (up to 2x)

- **6-Stage Flow**:
  1. "Do you like me?" 🥺❤️
  2. "Do you understand me?" 😞
  3. "Am I your safe place?" 🫶
  4. **Love Meter**: Interactive slider (0-10,000%)
  5. "Will you build a future with me?" ❤️
  6. "Will you be my Valentine?" 🌹

### 🎆 Celebration Effects
- **Heart Explosion**: Canvas-confetti with custom heart colors
- **Floating Hearts**: Continuous animated hearts in background
- **GSAP Transitions**: Smooth animations throughout
- **Custom Messages**: Personalized in Hinglish for authenticity

## 🚀 Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Lightning-fast build tool
- **GSAP** - Professional-grade animations
- **canvas-confetti** - Celebration effects
- **CSS3** - Custom properties, glassmorphism, animations

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Usage

### Development
```bash
npm run dev
```
Visit `http://localhost:5173` to see the app in development mode.

### Production Build
```bash
npm run build
```
Creates optimized production build in the `dist/` folder.

## 📁 Project Structure

```
lux-valentine/
├── src/
│   ├── components/
│   │   ├── QuestionStep.jsx    # Question component with evasive No button
│   │   └── Celebration.jsx     # Final celebration screen
│   ├── App.jsx                 # Main application logic
│   ├── App.css                 # App-specific styles
│   ├── index.css               # Global styles & design system
│   └── main.jsx                # Entry point
├── index.html                  # HTML template
├── package.json                # Dependencies
└── vite.config.js              # Vite configuration
```

## 🎨 Customization

### Change Messages
Edit the `questions` array in `src/App.jsx`:

```javascript
const questions = [
  {
    id: 1,
    text: "Your custom question here",
    yesText: "Yes!",
    noText: "No"
  },
  // ... more questions
];
```

### Change Colors
Modify CSS variables in `src/index.css`:

```css
:root {
  --sys-bg: #FCF8F8;
  --sys-accent: #F5AFAF;
  /* ... more colors */
}
```

### Adjust Animations
Modify GSAP animations in components:

```javascript
gsap.to('.element', {
  duration: 0.3,
  ease: 'power2.out',
  // ... animation properties
});
```

## 🎮 How It Works

### No Button Evasion (Desktop)
The No button uses cursor proximity detection:
1. Tracks mouse position in real-time
2. Calculates distance from cursor to button center
3. When cursor enters 150px radius, button "flees"
4. Uses `Math.atan2` to calculate escape angle
5. GSAP animates to new position smoothly

```javascript
const distance = Math.sqrt(
  Math.pow(e.clientX - btnCenterX, 2) + 
  Math.pow(e.clientY - btnCenterY, 2)
);

if (distance < escapeDistance) {
  const angle = Math.atan2(btnCenterY - e.clientY, btnCenterX - e.clientX);
  // Calculate new position and animate
}
```

### No Button Evasion (Mobile)
On touch devices, button jumps to random valid location:
```javascript
const newX = Math.random() * (window.innerWidth - rect.width - padding);
const newY = Math.random() * (window.innerHeight - rect.height - padding);
gsap.to(noButton, { x: newX, y: newY, duration: 0.3 });
```

## 🌟 Key Features Explained

### Glassmorphism
Achieved using backdrop-filter and semi-transparent backgrounds:
```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

### Love Meter
Interactive slider with dynamic messages based on percentage:
- 0-100%: "Perfect amount of love 💕"
- 100-1000%: "Perfect amount of love 💕"
- 1000-2000%: "Bas ab aur nahi… dil full ho gaya ❤️✨"
- 2000-5000%: "Yeshu tu bohot zyada cute hai 😭💘"
- 5000+%: "Itna pyaar?! 😍💝 Meri jaan le legi kya 🥰"

### Celebration Confetti
Uses canvas-confetti with custom configuration:
```javascript
confetti({
  particleCount: 50,
  spread: 360,
  colors: ['#F5AFAF', '#E89999', '#FF6B9D'],
  shapes: ['circle', 'square'],
});
```

## 🔧 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Note**: Glassmorphism effects require modern browsers with backdrop-filter support.

## 📱 Mobile Optimization

- Touch-friendly button sizes
- Responsive typography (clamp)
- Mobile-specific No button behavior
- Optimized animations for mobile performance
- Viewport meta tag for proper scaling

## 🎁 Deployment Options

### GitHub Pages
```bash
npm run build
# Deploy dist/ folder to GitHub Pages
```

### Netlify
1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`

### Vercel
```bash
vercel deploy
```

## 🐛 Troubleshooting

**Issue**: No button doesn't move
- **Solution**: Ensure GSAP is properly imported and button has `position: fixed`

**Issue**: Confetti doesn't show
- **Solution**: Check canvas-confetti is installed: `npm install canvas-confetti`

**Issue**: Glassmorphism not working
- **Solution**: Update to modern browser or add `-webkit-` prefix

## 📝 License

MIT License - Feel free to use for your own Valentine!

## 💝 Credits

Created with love for Yeshu ❤️

**Technologies Used**:
- React - UI library
- GSAP - Animation engine
- canvas-confetti - Celebration effects
- Vite - Build tool
- Google Fonts - Typography

## 🌹 Special Message

*"Valentine sirf ek din ka nahi, tu meri har din ki Valentine hai"* 🫶

---

**Made with 💕 for Valentine's Day 2025**
