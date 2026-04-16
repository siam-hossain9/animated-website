import { useRef, useEffect, useState } from 'react'
import BurningPetals from './BurningPetals'
import letterText from './letterContent'
import './LetterSection.css'

const LetterSection = ({ onVisible }) => {
  const canvasRef = useRef(null)
  const textWrapperRef = useRef(null)
  const sectionRef = useRef(null)
  const [autoScroll, setAutoScroll] = useState(false)
  const [started, setStarted] = useState(false)
  const autoScrollSpeed = useRef(0.6)

  // Fire particles background
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
      constructor() { this.reset() }
      reset() {
        this.x = Math.random() * canvas.width
        this.y = canvas.height + Math.random() * 40
        this.size = Math.random() * 5 + 2
        this.speedY = -(Math.random() * 2.5 + 1)
        this.speedX = (Math.random() - 0.5) * 1.2
        this.life = 1
        this.decay = Math.random() * 0.012 + 0.004
        const c = Math.random()
        if (c < 0.3) { this.r = 255; this.g = 220; this.b = 50 }
        else if (c < 0.6) { this.r = 255; this.g = 120; this.b = 20 }
        else if (c < 0.85) { this.r = 230; this.g = 40; this.b = 10 }
        else { this.r = 180; this.g = 20; this.b = 5 }
      }
      update() {
        this.x += this.speedX + (Math.random() - 0.5) * 0.6
        this.y += this.speedY
        this.life -= this.decay
        this.size *= 0.996
        if (this.life <= 0 || this.y < -20) this.reset()
      }
      draw() {
        ctx.save()
        ctx.globalAlpha = this.life * 0.6
        ctx.globalCompositeOperation = 'lighter'
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3)
        g.addColorStop(0, `rgba(${this.r},${this.g},${this.b},${this.life * 0.5})`)
        g.addColorStop(0.4, `rgba(${this.r},${this.g * 0.6},${this.b * 0.3},${this.life * 0.2})`)
        g.addColorStop(1, 'transparent')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${this.life})`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    for (let i = 0; i < 150; i++) {
      const p = new FireParticle()
      p.y = Math.random() * canvas.height
      p.life = Math.random()
      particles.push(p)
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height)
      bg.addColorStop(0, 'rgba(10,5,2,0.12)')
      bg.addColorStop(0.6, 'rgba(30,10,5,0.04)')
      bg.addColorStop(1, 'rgba(50,12,5,0.08)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => { p.update(); p.draw() })
      animId = requestAnimationFrame(animate)
    }
    animate()

    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  // Auto-scroll text upward — only runs after started
  useEffect(() => {
    const wrapper = textWrapperRef.current
    if (!wrapper || !started) return

    let animId
    const scrollUp = () => {
      if (autoScroll && wrapper) {
        const maxScroll = wrapper.scrollHeight - wrapper.clientHeight
        if (wrapper.scrollTop < maxScroll) {
          wrapper.scrollTop += autoScrollSpeed.current
        }
      }
      animId = requestAnimationFrame(scrollUp)
    }
    scrollUp()

    return () => cancelAnimationFrame(animId)
  }, [autoScroll, started])

  // Detect when section is visible to trigger music
  useEffect(() => {
    const section = sectionRef.current
    if (!section || !onVisible) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [onVisible])

  // Pause auto-scroll when user manually scrolls, resume after 3s
  const handleUserScroll = () => {
    setAutoScroll(false)
    clearTimeout(handleUserScroll._timer)
    handleUserScroll._timer = setTimeout(() => setAutoScroll(true), 3000)
  }

  const handleTitleClick = () => {
    if (!started) {
      setStarted(true)
      setAutoScroll(true)
    }
  }

  return (
    <section className="scroll-section section-letter" ref={sectionRef}>
      <canvas ref={canvasRef} className="letter-fire-canvas"></canvas>
      <BurningPetals />
      <div className="letter-fire-overlay"></div>
      <div className="letter-content">
        {!started ? (
          <h1 className="letter-title letter-title--clickable" onClick={handleTitleClick}>
            THE MANIFESTO
          </h1>
        ) : (
          <>
            <div
              className="letter-text-scroll"
              ref={textWrapperRef}
              onWheel={handleUserScroll}
              onTouchMove={handleUserScroll}
            >
              <div className="letter-text-spacer"></div>
              <h1 className="letter-title">THE MANIFESTO</h1>
              {letterText.map((para, i) => (
                <p className="letter-paragraph" key={i}>{para}</p>
              ))}
              <div className="letter-text-spacer"></div>
            </div>
            <div className="letter-scroll-hint">
              {autoScroll ? 'scroll to control' : 'auto-resuming...'}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default LetterSection

