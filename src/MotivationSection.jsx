import { useState } from 'react'
import './MotivationSection.css'

const motivationCards = [
  {
    text: "True innovation demands risk. The most memorable digital experiences aren't born from playing it safe; they emerge when we challenge established conventions and leverage technology in ways previously considered impossible."
  },
  {
    text: "Complexity is inevitable; complicated is a choice. We engineer robust, heavy-lifting systems that present themselves as frictionless, intuitive interfaces. The mark of brilliant engineering is ultimate simplicity."
  },
  {
    text: "Form and function are not opposing forces. We operate on the principle that aesthetic beauty and algorithmic efficiency must co-exist to create products that feel undeniably alive."
  }
]

const MotivationSection = () => {
  const [activeCard, setActiveCard] = useState(0)

  const goNext = () => {
    setActiveCard((prev) => (prev + 1) % motivationCards.length)
  }
  const goPrev = () => {
    setActiveCard((prev) => (prev - 1 + motivationCards.length) % motivationCards.length)
  }

  return (
    <section className="scroll-section section-motivation">
      <div className="motivation-wrapper">
        <h1 className="motivation-title">PHILOSOPHY</h1>
        <div className="motivation-card-area">
          <button className="nav-arrow nav-left" onClick={goPrev}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="motivation-card" key={activeCard}>
            <div className="card-glow"></div>
            <div className="card-inner">
              <span className="card-index">{String(activeCard + 1).padStart(2, '0')}</span>
              <p className="motivation-text">{motivationCards[activeCard].text}</p>
            </div>
            <div className="card-shine"></div>
          </div>
          <button className="nav-arrow nav-right" onClick={goNext}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
        <div className="motivation-progress">
          {motivationCards.map((_, i) => (
            <div
              key={i}
              className={`progress-bar ${i === activeCard ? 'progress-active' : ''} ${i < activeCard ? 'progress-done' : ''}`}
              onClick={() => { setActiveCard(i) }}
            ></div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MotivationSection
