import { useEffect, useRef } from 'react';

const BurningPetals = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const TOTAL = 45;
    let petalArray = [];
    let animationFrameId;
    let mouseX = 0;

    class BurningPetal {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = (Math.random() * canvas.height * 2) - canvas.height;
        this.w = 20 + Math.random() * 18;
        this.h = 14 + Math.random() * 10;
        this.opacity = 0.5 + Math.random() * 0.5;
        this.flip = Math.random() * Math.PI * 2;
        this.rotation = Math.random() * Math.PI * 2;

        this.xSpeed = 1.0 + Math.random() * 1.5;
        this.ySpeed = 0.8 + Math.random() * 1;
        this.flipSpeed = Math.random() * 0.03;
        this.rotSpeed = (Math.random() - 0.5) * 0.04;
        
        // Fire color palette
        const pick = Math.random();
        if (pick < 0.25) {
          this.color = { r: 255, g: 200, b: 50 };   // bright yellow
        } else if (pick < 0.5) {
          this.color = { r: 255, g: 130, b: 20 };   // orange
        } else if (pick < 0.75) {
          this.color = { r: 240, g: 60, b: 10 };    // red-orange
        } else {
          this.color = { r: 200, g: 30, b: 5 };     // deep red
        }
        
        // Ember trail
        this.trail = [];
        this.trailMax = 6 + Math.floor(Math.random() * 4);
      }

      draw() {
        if (this.y > canvas.height + 20 || this.x > canvas.width + 20) {
          this.x = -30;
          this.y = (Math.random() * canvas.height * 2) - canvas.height;
          this.xSpeed = 1.0 + Math.random() * 1.5;
          this.ySpeed = 0.8 + Math.random() * 1;
          this.flip = Math.random() * Math.PI * 2;
          this.trail = [];
        }

        // Draw ember trail
        for (let i = 0; i < this.trail.length; i++) {
          const t = this.trail[i];
          const fade = i / this.trail.length;
          const size = 2 + fade * 2;
          ctx.save();
          ctx.globalAlpha = fade * 0.4 * this.opacity;
          ctx.globalCompositeOperation = 'lighter';
          const grd = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, size * 2);
          grd.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${fade * 0.6})`);
          grd.addColorStop(1, 'transparent');
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(t.x, t.y, size * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Draw the burning petal shape
        const scaleX = 0.6 + (Math.abs(Math.cos(this.flip)) / 3);
        const scaleY = 0.8 + (Math.abs(Math.sin(this.flip)) / 5);
        const w = this.w * scaleX;
        const h = this.h * scaleY;

        ctx.save();
        ctx.translate(this.x + w / 2, this.y + h / 2);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity * 0.85;

        // Outer glow
        ctx.globalCompositeOperation = 'lighter';
        const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(w, h));
        glowGrad.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.5)`);
        glowGrad.addColorStop(0.5, `rgba(${this.color.r}, ${Math.floor(this.color.g * 0.5)}, 0, 0.2)`);
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(w, h), 0, Math.PI * 2);
        ctx.fill();

        // Petal body (leaf shape)
        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();
        ctx.moveTo(0, -h / 2);
        ctx.bezierCurveTo(w / 2, -h / 3, w / 2, h / 3, 0, h / 2);
        ctx.bezierCurveTo(-w / 2, h / 3, -w / 2, -h / 3, 0, -h / 2);
        ctx.closePath();
        
        const bodyGrad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
        bodyGrad.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.9)`);
        bodyGrad.addColorStop(0.5, `rgba(${this.color.r}, ${Math.floor(this.color.g * 0.7)}, ${Math.floor(this.color.b * 0.5)}, 0.7)`);
        bodyGrad.addColorStop(1, `rgba(${Math.floor(this.color.r * 0.6)}, ${Math.floor(this.color.g * 0.3)}, 0, 0.4)`);
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // Hot white core
        ctx.globalAlpha = this.opacity * 0.4;
        const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.3);
        coreGrad.addColorStop(0, 'rgba(255, 255, 220, 0.8)');
        coreGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, 0, w * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animate() {
        // Store trail position
        this.trail.unshift({ x: this.x + this.w / 2, y: this.y + this.h / 2 });
        if (this.trail.length > this.trailMax) this.trail.pop();

        this.x += this.xSpeed + mouseX * 2;
        this.y += this.ySpeed + mouseX * 1;
        this.flip += this.flipSpeed;
        this.rotation += this.rotSpeed;
        this.draw();
      }
    }

    const initPetals = () => {
      petalArray = [];
      for (let i = 0; i < TOTAL; i++) {
        petalArray.push(new BurningPetal());
      }
      render();
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petalArray.forEach(petal => petal.animate());
      animationFrameId = window.requestAnimationFrame(render);
    };

    initPetals();

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
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2
      }}
    />
  );
};

export default BurningPetals;
