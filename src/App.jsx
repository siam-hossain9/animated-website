import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'
import { useState, useRef, useEffect, useCallback } from 'react'
import Petals from './Petals'
import Flowers from './Flowers'
import BlobSection from './BlobSection'
import MotivationSection from './MotivationSection'
import JealousySection from './JealousySection'
import LetterSection from './LetterSection'
import CursorPetals from './CursorPetals'
import './App.css'

const AnimatedText = () => {
  const lines = [
    { text: "Designing digital experiences," },
    { text: "engineering tomorrow," },
    { text: "and pushing the boundaries", hasCursor: true },
    { isBreak: true },
    { text: "of immersive web architecture.", isFade: true }
  ];

  let wordIndex = 0;
  return (
    <>
      {lines.map((line, i) => {
        if (line.isBreak) return <span key={i}><br /><br /></span>;
        
        const words = line.text.split(' ');
        return (
          <span key={i} style={{ display: 'inline-block', width: '100%' }}>
            {words.map((word, wIdx) => {
              const delay = wordIndex * 0.15 + 0.3;
              wordIndex++;
              return (
                <span 
                  key={wIdx} 
                  className={`word-reveal ${line.isFade ? 'fade-text' : ''}`}
                  style={{ animationDelay: `${delay}s` }}
                >
                  {word}{' '}
                </span>
              );
            })}
            {line.hasCursor && (
              <span 
                className="cursor-blink word-reveal" 
                style={{ animationDelay: `${wordIndex * 0.15 + 0.3}s` }}
              >
                _
              </span>
            )}
          </span>
        );
      })}
    </>
  );
};

const cards = [
  {
    title: "Vision",
    text: "We see beyond the screen. An interface is more than a tool; it is a canvas where human interaction meets technological possibility. Our approach combines bold aesthetics with uncompromising functionality, ensuring every project not only looks stunning but redefines user expectations in the digital landscape."
  },
  {
    title: "Architecture",
    text: "A beautiful design means nothing without a robust foundation. We architect software designed for scale, speed, and security. By leveraging modern frameworks and optimizing for performance from day one, we guarantee that the experiences we build are as resilient as they are breathtaking."
  },
  {
    title: "Design",
    text: "Pixel-perfect precision isn't a goal; it's our baseline. We craft visual systems that command attention and communicate brand identity implicitly. Typography, spacing, color, and motion are orchestrated together to create a seamless, intuitive, and unforgettable user journey."
  },
  {
    title: "Innovation",
    text: "We refuse to remain stagnant. By constantly integrating the latest advancements in WebGL, custom shader programming, and responsive fluid layouts, we push the envelope of what is possible in the browser. Innovation isn't just a buzzword; it's encoded in our daily workflow."
  },
  {
    title: "Performance",
    text: "Speed is a feature. We optimize every asset, every render cycle, and every network request to deliver 60 frames-per-second performance. An immersive experience loses its magic if it stutters, which is why we engineer front-end delivery to be flawlessly smooth and incredibly fast."
  },
  {
    title: "Impact",
    text: "Ultimately, we build to create impact. Whether it's shifting market perceptions, driving user engagement, or visualizing complex data, our digital products are designed to deliver tangible results. We partner with visionaries to turn ambitious ideas into digital reality."
  }
];

const CardCarousel = () => {
  const [activeCard, setActiveCard] = useState(0);

  const goNext = () => setActiveCard((prev) => (prev + 1) % cards.length);
  const goPrev = () => setActiveCard((prev) => (prev - 1 + cards.length) % cards.length);

  return (
    <div className="carousel-wrapper">
      <div className="carousel-card">
        <div className="card-number">{activeCard + 1} / {cards.length}</div>
        <h2 className="card-title">{cards[activeCard].title}</h2>
        <div className="card-divider"></div>
        <p className="card-text">{cards[activeCard].text}</p>
      </div>
      <div className="carousel-controls">
        <button className="carousel-btn" onClick={goPrev}>
          <span className="arrow-left"></span> prev
        </button>
        <div className="carousel-dots">
          {cards.map((_, i) => (
            <span 
              key={i} 
              className={`dot ${i === activeCard ? 'dot-active' : ''}`}
              onClick={() => setActiveCard(i)}
            ></span>
          ))}
        </div>
        <button className="carousel-btn" onClick={goNext}>
          next <span className="arrow-right"></span>
        </button>
      </div>
    </div>
  );
};

function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollProgress, setScrollProgress] = useState(0)
  const [playing, setPlaying] = useState(false)
  const textRef = useRef(null)
  const audioRef = useRef(null)
  const lesAudioRef = useRef(null)
  const lesStartedRef = useRef(false)

  const startLesMusic = useCallback(() => {
    if (lesAudioRef.current && !lesStartedRef.current) {
      lesStartedRef.current = true
      lesAudioRef.current.volume = 0.5
      lesAudioRef.current.play().catch(() => {})
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      setMousePosition({ x, y })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const wh = window.innerHeight
      const totalScrollable = document.body.scrollHeight - wh
      const raw = window.scrollY / wh
      setScrollProgress(raw)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const startMusic = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause()
      } else {
        audioRef.current.volume = 0.5
        audioRef.current.play()
      }
      setPlaying(!playing)
    }
  }

  const textStyle = {
    transform: `perspective(1000px) rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg)`,
    transition: 'transform 0.1s ease-out'
  }

  // Flower opacity: visible from 0-2, fades between 2-3, gone after 3
  const flowerOpacity = scrollProgress < 2 ? 1 : scrollProgress < 3 ? 1 - (scrollProgress - 2) : 0
  // Flower scatter
  const flowerTranslateX = scrollProgress > 1 ? Math.min((scrollProgress - 1) * -30, 0) : 0
  const flowerScale = scrollProgress > 1 ? Math.max(0.9 - (scrollProgress - 1) * 0.3, 0.2) : 0.9

  return (
    <div className="main-scroll-wrapper">
      {/* Fixed Backgrounds */}
      <ShaderGradientCanvas style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 0 }}>
        <ShaderGradient
          animate="on" axesHelper="off" bgColor1="#000000" bgColor2="#000000"
          brightness={1} cAzimuthAngle={180} cDistance={2.8} cPolarAngle={80}
          cameraZoom={9.1} color1="#606080" color2="#8d7dca" color3="#212121"
          destination="onCanvas" embedMode="off" envPreset="city" format="gif"
          fov={45} frameRate={10} gizmoHelper="hide" grain="on" lightType="3d"
          pixelDensity={1} positionX={0} positionY={0} positionZ={0} range="disabled"
          rangeEnd={40} rangeStart={0} reflection={0.1} rotationX={50} rotationY={0}
          rotationZ={-60} shader="defaults" type="waterPlane" uAmplitude={0}
          uDensity={1.5} uFrequency={0} uSpeed={0.3} uStrength={1.5} uTime={8}
          wireframe={false}
        />
      </ShaderGradientCanvas>

      {/* Flowers - Fixed, scatter and vanish on scroll */}
      <div style={{ 
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
        zIndex: 3, pointerEvents: 'none',
        opacity: flowerOpacity,
        transform: `translateX(${flowerTranslateX}vw) scale(${flowerScale})`,
        transition: 'opacity 0.3s ease-out'
      }}>
        <Flowers />
      </div>

      {/* Petals - always visible */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 5, pointerEvents: 'none' }}>
        <Petals />
      </div>

      {/* ===================== SCROLLABLE CONTENT ===================== */}

      {/* Section 1: Opening Text */}
      <section className="scroll-section section-intro">
        <div className="center-panel">
          <div className="text-container" ref={textRef} style={textStyle}>
            <p className="poetic-text">
              <AnimatedText />
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Music Prompt */}
      <section className="scroll-section section-music">
        <div className="music-prompt-container">
          <h2 className="poetic-text glow-text">Initialize Audio Experience</h2>
          <button onClick={startMusic} className="music-btn glow-text">
            {playing ? 'system audio active' : 'press to start audio processing'}
          </button>
          <p className="scroll-hint">{playing ? 'scroll down to proceed into the experience' : ''}</p>
        </div>
      </section>

      {/* Section 3: Card Carousel */}
      <section className="scroll-section section-cards">
        <CardCarousel />
      </section>

      {/* Section 4: Final Message */}
      <section className="scroll-section section-final">
        <div className="final-message-container">
          <p className="final-text">
            We operate at the intersection of design, technology, and strategy.
            In an increasingly crowded digital landscape, standing out requires more than just functional code.
            It demands an entirely new standard of digital immersiveness.
            We specialize in crafting experiences that capture attention and refuse to let go.
          </p>
          <p className="final-text">
            Leveraging advanced web APIs, native physics integrations, and custom vertex shading,
            we translate abstract ideas into tangible, high-performance web products.
            Whether building interactive data visualizations or premium luxury e-commerce platforms,
            our methodology remains the same: push boundaries until the impossible is rendered.
          </p>
          <p className="final-text">
            Digital craftsmanship isn't just our job. It's our obsession.
            We believe that every line of code matters and every pixel tells a story.
          </p>
          <p className="final-text final-highlight">
            AURA Studio
          </p>
          <p className="final-text">
            Transforming ambitious visions into digital reality.
            Welcome to the new standard of web engineering.
          </p>
        </div>
      </section>

      {/* Section 5: 3D Blob Fun Section */}
      <BlobSection />

      {/* Section 6: Motivation Cards */}
      <MotivationSection />

      {/* Section 7: Poetry */}
      <section className="scroll-section section-poetry">
        <div className="poetry-container">
          <p className="poetry-line">Forward-Thinking Strategy</p>
          <p className="poetry-line">Data-Driven User Experience</p>
          <p className="poetry-line">Custom WebGL Shaders</p>
          <p className="poetry-line">High-Performance Rendering Architecture</p>
          <p className="poetry-line">Fluid Interactive Design Systems</p>
          <p className="poetry-line">Advanced Three.js Integrations</p>
          <p className="poetry-line">State-Of-The-Art Front-End Engineering</p>
          <p className="poetry-line">Pixel-Level Mathematical Precision</p>
          <p className="poetry-line">Next-Generation Micro-Interactions</p>
          <p className="poetry-line">Headless CMS Solutions</p>
          <p className="poetry-line">Global Edge Delivery</p>
          <p className="poetry-line">Server-Side Rendering Pipelines</p>
          <p className="poetry-line">Motion Design Orchestration</p>
          <p className="poetry-line">Complex Data Visualization Engines</p>
          <p className="poetry-line">Immersive Cross-Platform Architecture</p>
          <p className="poetry-line">Creative Software Development</p>
          <p className="poetry-line">Enterprise Scalability Systems</p>
          <p className="poetry-line poetry-highlight">Engineering The Future Of The Web</p>
        </div>
      </section>

      {/* Section 8: Jealousy with Fire */}
      <JealousySection />

      {/* Section 9: Letter with fire + burning petals + auto-scroll text */}
      <LetterSection onVisible={startLesMusic} />

      {/* Audio */}
      <audio ref={audioRef} src="/song.mp3" loop />
      <audio ref={lesAudioRef} src="/les.mp3" loop />

      {/* Cursor petal effects - global overlay */}
      <CursorPetals />
    </div>
  )
}

export default App
