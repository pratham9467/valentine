import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

function ParticleTrail({ isActive, buttonRef }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particle class
    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 8 + 4;
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4;
        this.color = color;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        this.size *= 0.96;
      }

      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      isDead() {
        return this.life <= 0 || this.size < 0.5;
      }
    }

    // Track button position
    let lastPos = { x: 0, y: 0 };
    let frameCount = 0;

    const animate = () => {
      if (!buttonRef.current || !isActive) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(252, 248, 248, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const rect = buttonRef.current.getBoundingClientRect();
      const btnX = rect.left + rect.width / 2;
      const btnY = rect.top + rect.height / 2;

      // Create trail particles every few frames
      if (frameCount % 2 === 0) {
        const dx = btnX - lastPos.x;
        const dy = btnY - lastPos.y;
        const speed = Math.sqrt(dx * dx + dy * dy);

        if (speed > 1) {
          // Create particles based on speed
          const particleCount = Math.min(Math.floor(speed / 10), 5);
          const colors = ['#FF6B9D', '#F5AFAF', '#FFB6C1', '#FF69B4'];

          for (let i = 0; i < particleCount; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            particlesRef.current.push(new Particle(btnX, btnY, color));
          }
        }
      }

      lastPos = { x: btnX, y: btnY };

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.update();
        particle.draw(ctx);
        return !particle.isDead();
      });

      frameCount++;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, buttonRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 999,
      }}
    />
  );
}

ParticleTrail.propTypes = {
  isActive: PropTypes.bool.isRequired,
  buttonRef: PropTypes.object.isRequired,
};

export default ParticleTrail;
