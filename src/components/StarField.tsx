
import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
}

const StarField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createStars = (count: number) => {
      const stars: Star[] = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
        });
      }
      return stars;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    resizeCanvas();
    starsRef.current = createStars(200);

    const animate = (time: number) => {
      ctx.fillStyle = '#0B1426';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach((star, index) => {
        // Reverse parallax effect - stars move opposite to cursor
        const parallaxStrength = 0.02;
        const offsetX = (mouseRef.current.x - canvas.width / 2) * parallaxStrength * star.size;
        const offsetY = (mouseRef.current.y - canvas.height / 2) * parallaxStrength * star.size;
        
        const x = star.x - offsetX;
        const y = star.y - offsetY;

        // Twinkling effect
        const twinkle = Math.sin(time * star.twinkleSpeed) * 0.3 + 0.7;
        const opacity = star.opacity * twinkle;

        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();

        // Add glow for larger stars
        if (star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(x, y, star.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(99, 102, 241, ${opacity * 0.3})`;
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', () => {
      resizeCanvas();
      starsRef.current = createStars(200);
    });
    
    window.addEventListener('mousemove', handleMouseMove);
    animate(0);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: 'linear-gradient(135deg, #0B1426 0%, #1E3A8A 50%, #0B1426 100%)' }}
    />
  );
};

export default StarField;
