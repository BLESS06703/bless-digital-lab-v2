import { ArrowUpRight } from 'lucide-react'

function About() {
  return (
    <section className="section about-section" id="about">
      <div className="section-heading">
        <span className="section-number">01</span>
        <span className="section-label">About the lab</span>
      </div>

      <div className="about-layout">
        <div className="about-title">
          <p>Ideas into</p>
          <h2>digital reality.</h2>
        </div>

        <div className="about-content">
          <p className="about-lead">
            Bless Digital Lab is a creative technology studio focused on
            building useful digital products and distinctive visual
            experiences.
          </p>

          <p>
            From business websites and web applications to mobile software and
            graphic design, the goal is simple: combine thoughtful design with
            practical technology to create work that people can actually use.
          </p>

          <a href="#contact" className="text-link">
            Let's work together
            <ArrowUpRight size={17} />
          </a>
        </div>
      </div>

      <div className="about-stats">
        <div>
          <strong>01</strong>
          <span>Creative direction</span>
        </div>

        <div>
          <strong>02</strong>
          <span>Development</span>
        </div>

        <div>
          <strong>03</strong>
          <span>Visual design</span>
        </div>

        <div>
          <strong>04</strong>
          <span>Digital solutions</span>
        </div>
      </div>
    </section>
  )
}

export default About
