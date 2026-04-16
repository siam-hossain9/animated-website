import { useRef, useEffect } from 'react'
import BurningPetals from './BurningPetals'
import './JealousySection.css'

const JealousySection = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animId
    let particles = []

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth
      canvas.height = canvas.parentElement.clientHeight
    }
    resize()

    class FireParticle {
      constructor() {
        this.reset()
      }
      reset() {
        this.x = Math.random() * canvas.width
        this.y = canvas.height + Math.random() * 40
        this.size = Math.random() * 6 + 2
        this.speedY = -(Math.random() * 3 + 1.5)
        this.speedX = (Math.random() - 0.5) * 1.5
        this.life = 1
        this.decay = Math.random() * 0.015 + 0.005
        // Fire colors: bright yellow -> orange -> red -> dark red
        const colorChoice = Math.random()
        if (colorChoice < 0.3) {
          this.r = 255; this.g = 220; this.b = 50; // yellow
        } else if (colorChoice < 0.6) {
          this.r = 255; this.g = 120; this.b = 20; // orange
        } else if (colorChoice < 0.85) {
          this.r = 230; this.g = 40; this.b = 10; // red
        } else {
          this.r = 180; this.g = 20; this.b = 5; // dark red
        }
      }
      update() {
        this.x += this.speedX + (Math.random() - 0.5) * 0.8
        this.y += this.speedY
        this.life -= this.decay
        this.size *= 0.995
        if (this.life <= 0 || this.y < -20) {
          this.reset()
        }
      }
      draw() {
        ctx.save()
        ctx.globalAlpha = this.life * 0.7
        ctx.globalCompositeOperation = 'lighter'
        
        // Glow
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3)
        gradient.addColorStop(0, `rgba(${this.r}, ${this.g}, ${this.b}, ${this.life * 0.6})`)
        gradient.addColorStop(0.4, `rgba(${this.r}, ${this.g * 0.6}, ${this.b * 0.3}, ${this.life * 0.3})`)
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2)
        ctx.fill()

        // Core
        ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.life})`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    // Create particles
    for (let i = 0; i < 200; i++) {
      const p = new FireParticle()
      p.y = Math.random() * canvas.height // Spread initially
      p.life = Math.random()
      particles.push(p)
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Dark overlay gradient from top
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height)
      bgGrad.addColorStop(0, 'rgba(10, 5, 2, 0.15)')
      bgGrad.addColorStop(0.6, 'rgba(30, 10, 5, 0.05)')
      bgGrad.addColorStop(1, 'rgba(60, 15, 5, 0.1)')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach(p => {
        p.update()
        p.draw()
      })
      animId = requestAnimationFrame(animate)
    }
    animate()

    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <section className="scroll-section section-jealousy">
      <canvas ref={canvasRef} className="fire-canvas"></canvas>
      <BurningPetals />
      <div className="fire-overlay"></div>
      <div className="jealousy-content">
        <h1 className="jealousy-title">OUR DRIVE</h1>
        <div className="jealousy-text-container">
          <p className="jealousy-text">
            We are obsessively dedicated to the craft of digital engineering.
            We refuse to tolerate mediocrity.
            We don't want anyone else setting the standard for how the internet should look and feel.
          </p>
          <p className="jealousy-text">
            Every pixel? Methodically placed.
            Every frame? Rendered at peak velocity.
            The way our interfaces respond to the slightest user input? That precision is our signature.
            Your code, your assets, your rendering pipeline, the seamless moments when it all effortlessly clicks together, every single part of it must be flawless.
          </p>
          <p className="jealousy-text">
            We hate the idea of shipping anything less than extraordinary.
            We want total command over the digital experience, selfishly, completely, obsessively.
            The architecture, the visual fire, the intricate logic, the silent performance... we optimize every single facet.
          </p>
          <p className="jealousy-text jealousy-bold">
            The concepts are ours to execute.
            The environment is ours to build.
            The digital frontier is ours to conquer.
          </p>
          <p className="jealousy-text">
            Call us relentless, call us exhaustive, we don't care.
            This is how deeply we believe in what we do.
            We are fiercely protective over the quality of the products we deploy into the world.
          </p>
          <p className="jealousy-text jealousy-final">
            The future belongs to the builders.
            Every immersive, complex, beautiful, and flawless digital experience we create is proof...
            and we're never letting the standard drop.
          </p>
        </div>
      </div>
    </section>
  )
}

export default JealousySection
