import React, { useEffect, useRef } from 'react';

const Petals = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas to full window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const TOTAL = 60; // Slightly reduced for elegance and performance
    let petalArray = [];
    let animationFrameId;
    let mouseX = 0;

    const petalImg = new Image();
    
    // Define render first before it's called
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petalArray.forEach(petal => petal.animate());
      animationFrameId = window.requestAnimationFrame(render);
    };

    class Petal {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = (Math.random() * canvas.height * 2) - canvas.height;
        this.w = 25 + Math.random() * 15;
        this.h = 20 + Math.random() * 10;
        this.opacity = this.w / 40;
        this.flip = Math.random();

        this.xSpeed = 1.0 + Math.random() * 1.5;
        this.ySpeed = 0.8 + Math.random() * 1;
        this.flipSpeed = Math.random() * 0.03;
      }

      draw() {
        if (this.y > canvas.height || this.x > canvas.width) {
          this.x = -petalImg.width;
          this.y = (Math.random() * canvas.height * 2) - canvas.height;
          this.xSpeed = 1.0 + Math.random() * 1.5;
          this.ySpeed = 0.8 + Math.random() * 1;
          this.flip = Math.random();
        }
        ctx.globalAlpha = this.opacity * 0.8;
        ctx.drawImage(
          petalImg, 
          this.x, 
          this.y, 
          this.w * (0.6 + (Math.abs(Math.cos(this.flip)) / 3)), 
          this.h * (0.8 + (Math.abs(Math.sin(this.flip)) / 5))
        );
      }

      animate() {
        this.x += this.xSpeed + mouseX * 2;
        this.y += this.ySpeed + mouseX * 1;
        this.flip += this.flipSpeed;
        this.draw();
      }
    }

    const initPetals = () => {
      // Clear array to prevent duplication in React StrictMode
      petalArray = [];
      for (let i = 0; i < TOTAL; i++) {
        petalArray.push(new Petal());
      }
      // Cancel previous frame just in case
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
      render();
    };

    petalImg.onload = initPetals;
    // Set src AFTER onload
    petalImg.src = 'https://djjjk9bjm164h.cloudfront.net/petal.png';
    // Fallback if immediately loaded from cache
    if (petalImg.complete && petalArray.length === 0) {
      initPetals();
    }

    const touchHandler = (e) => {
      mouseX = (e.clientX || (e.touches && e.touches[0].clientX) || window.innerWidth / 2) / window.innerWidth;
    };
    
    window.addEventListener('mousemove', touchHandler);
    window.addEventListener('touchmove', touchHandler, { passive: true });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', touchHandler);
      window.removeEventListener('touchmove', touchHandler);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none', // Let clicks pass through
        zIndex: 5, // Between background (0) and text (10)
        // CSS Filter to change the original pink to a soft glowing silver-lavender
        // hue-rotate(240deg) shifts pink towards purple/blue
        // saturate(0.6) and brightness(1.5) makes it soft and glowing
        filter: 'hue-rotate(240deg) saturate(0.6) brightness(1.8)'
      }}
    />
  );
};

export default Petals;
