// ====================================================================
// FireBackground.tsx - the animated flames behind everything: a canvas of
// rising fire particles drawn fresh every frame. Pure atmosphere.
// ====================================================================
import React, { useEffect, useRef } from 'react';

const FireBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      fadeSpeed: number;
      color: string;
    }

    const particles: Particle[] = [];
    const particleCount = width < 768 ? 40 : 100; // Fewer particles on mobile

    const colors = [
      '234, 88, 12',  // Orange 600
      '249, 115, 22', // Orange 500
      '194, 65, 12',  // Orange 700
      '255, 255, 255' // White/hot
    ];

    const createParticle = (): Particle => {
      return {
        x: Math.random() * width,
        y: height + Math.random() * 100,
        size: Math.random() * 3 + 1,
        speedY: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        fadeSpeed: Math.random() * 0.005 + 0.002,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    };

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Create a subtle gradient at the bottom
      const gradient = ctx.createLinearGradient(0, height, 0, height - 200);
      gradient.addColorStop(0, 'rgba(20, 5, 0, 0.8)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p, index) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.opacity -= p.fadeSpeed;

        if (p.opacity <= 0) {
          particles[index] = createParticle();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
        ctx.fill();

        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${p.color}, 0.5)`;
      });
      
      // Reset shadow for next frame performance
      ctx.shadowBlur = 0;

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 mix-blend-screen"
    />
  );
};

export default FireBackground;