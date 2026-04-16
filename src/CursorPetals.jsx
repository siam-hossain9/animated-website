import { useEffect, useRef } from 'react';

const CursorPetals = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];
    let mouseX = 0;
    let mouseY = 0;
    let isMouseDown = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    // Load the petal image for cursor trail
    const petalImg = new Image();
    petalImg.crossOrigin = 'anonymous';
    petalImg.src = 'https://djjjk9bjm164h.cloudfront.net/petal.png';

    class CursorPetal {
      constructor(x, y, burst = false) {
        this.x = x;
        this.y = y;
        this.w = burst ? 15 + Math.random() * 20 : 10 + Math.random() * 12;
        this.h = this.w * 0.7;
        this.opacity = 0.7 + Math.random() * 0.3;
        this.flip = Math.random() * Math.PI * 2;
        this.rotation = Math.random() * Math.PI * 2;
        this.life = 1;
        this.decay = burst ? 0.008 + Math.random() * 0.008 : 0.012 + Math.random() * 0.012;

        if (burst) {
          // Explode outward in all directions
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * 5;
          this.vx = Math.cos(angle) * speed;
          this.vy = Math.sin(angle) * speed;
        } else {
          // Gentle drift from cursor
          this.vx = (Math.random() - 0.5) * 2;
          this.vy = 0.5 + Math.random() * 1.5;
        }

        this.gravity = 0.03 + Math.random() * 0.02;
        this.flipSpeed = (Math.random() - 0.5) * 0.08;
        this.rotSpeed = (Math.random() - 0.5) * 0.06;
        this.friction = 0.98;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.flip += this.flipSpeed;
        this.rotation += this.rotSpeed;
        this.life -= this.decay;
        return this.life > 0;
      }

      draw() {
        const scaleX = 0.6 + (Math.abs(Math.cos(this.flip)) / 3);
        const scaleY = 0.8 + (Math.abs(Math.sin(this.flip)) / 5);
        const w = this.w * scaleX;
        const h = this.h * scaleY;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.life * this.opacity;

        if (petalImg.complete && petalImg.naturalWidth > 0) {
          // Draw the actual petal image with purple filter
          ctx.filter = 'hue-rotate(240deg) saturate(0.6) brightness(1.8)';
          ctx.drawImage(petalImg, -w / 2, -h / 2, w, h);
          ctx.filter = 'none';
        } else {
          // Fallback: draw a petal shape
          ctx.beginPath();
          ctx.moveTo(0, -h / 2);
          ctx.bezierCurveTo(w / 2, -h / 3, w / 2, h / 3, 0, h / 2);
          ctx.bezierCurveTo(-w / 2, h / 3, -w / 2, -h / 3, 0, -h / 2);
          ctx.closePath();
          ctx.fillStyle = `rgba(200, 180, 230, ${this.life})`;
          ctx.fill();
        }

        // Soft glow behind each petal
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = this.life * 0.15;
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, w);
        glow.addColorStop(0, 'rgba(141, 125, 202, 0.4)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, w, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    // Spawn petals on mouse move (throttled)
    const spawnMoveParticles = (x, y) => {
      const count = isMouseDown ? 4 : 1;
      for (let i = 0; i < count; i++) {
        particles.push(new CursorPetal(
          x + (Math.random() - 0.5) * 10,
          y + (Math.random() - 0.5) * 10,
          false
        ));
      }
    };

    // Spawn burst on click
    const spawnBurst = (x, y) => {
      const count = 20 + Math.floor(Math.random() * 15);
      for (let i = 0; i < count; i++) {
        particles.push(new CursorPetal(x, y, true));
      }
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Check if mouse actually moved enough
      const dx = mouseX - lastMouseX;
      const dy = mouseY - lastMouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 5) {
        spawnMoveParticles(mouseX, mouseY);
        lastMouseX = mouseX;
        lastMouseY = mouseY;
      }
    };

    const handleMouseDown = (e) => {
      isMouseDown = true;
      spawnBurst(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
        spawnMoveParticles(mouseX, mouseY);
      }
    };

    const handleTouchStart = (e) => {
      isMouseDown = true;
      if (e.touches && e.touches[0]) {
        spawnBurst(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      isMouseDown = false;
    };

    // Continuous spawn while mouse is held down
    const spawnInterval = setInterval(() => {
      if (isMouseDown) {
        spawnMoveParticles(mouseX, mouseY);
      }
    }, 50);

    // Animation loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw, remove dead particles
      particles = particles.filter(p => {
        const alive = p.update();
        if (alive) p.draw();
        return alive;
      });

      // Safety cap to prevent memory issues
      if (particles.length > 500) {
        particles = particles.slice(-500);
      }

      animId = requestAnimationFrame(render);
    };
    render();

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      clearInterval(spawnInterval);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 50
      }}
    />
  );
};

export default CursorPetals;
