import { ArrowDownRight, ArrowUpRight, Code2, Palette } from 'lucide-react'

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-grid" />

      <div className="hero-content">
        <div className="hero-eyebrow">
          <span className="status-dot" />
          Available for selected projects
        </div>

        <h1>
          Building
          <span>digital</span>
          experiences.
        </h1>

        <p className="hero-description">
          Bless Digital Lab creates modern websites, applications and visual
          identities for people and businesses ready to move forward.
        </p>

        <div className="hero-actions">
          <a className="button button-primary" href="#work">
            Explore my work
            <ArrowUpRight size={18} />
          </a>

          <a className="button button-secondary" href="/signin">
            Request a quote
            <ArrowUpRight size={18} />
          </a>
        </div>

        <div className="hero-disciplines">
          <div>
            <Code2 size={20} />
            <span>Web Development</span>
          </div>

          <div>
            <Palette size={20} />
            <span>Graphic Design</span>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="visual-orbit orbit-one" />
        <div className="visual-orbit orbit-two" />

        <div className="visual-core">
          <span>B</span>
          <small>DIGITAL LAB</small>
        </div>

        <div className="floating-label label-top">
          <span>01</span>
          DIGITAL
        </div>

        <div className="floating-label label-bottom">
          DESIGN × CODE
          <ArrowDownRight size={16} />
        </div>
      </div>

      <div className="hero-scroll">
        <span>Scroll to explore</span>
        <ArrowDownRight size={17} />
      </div>
    </section>
  )
}

export default Hero
