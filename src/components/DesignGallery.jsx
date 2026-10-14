import { ArrowUpRight } from 'lucide-react'

const designs = [
  {
    number: '01',
    title: 'Brand Identity',
    type: 'Branding',
  },
  {
    number: '02',
    title: 'Social Graphics',
    type: 'Social Media',
  },
  {
    number: '03',
    title: 'Promotional Design',
    type: 'Campaign',
  },
  {
    number: '04',
    title: 'Digital Artwork',
    type: 'Creative',
  },
]

function DesignGallery() {
  return (
    <section className="section design-section" id="design">
      <div className="section-heading">
        <span className="section-number">05</span>
        <span className="section-label">Graphic design</span>
      </div>

      <div className="design-intro">
        <h2>
          Visuals with
          <span>purpose.</span>
        </h2>

        <p>
          Design work that combines composition, typography and visual
          storytelling to help ideas communicate clearly.
        </p>
      </div>

      <div className="design-grid">
        {designs.map((design) => (
          <article className="design-item" key={design.number}>
            <div className="design-art">
              <div className="design-art-grid" />

              <span className="design-number">{design.number}</span>

              <div className="design-art-center">
                <span>B</span>
              </div>

              <span className="design-type">{design.type}</span>
            </div>

            <div className="design-caption">
              <div>
                <span>{design.type}</span>
                <h3>{design.title}</h3>
              </div>

              <ArrowUpRight size={19} />
            </div>
          </article>
        ))}
      </div>

      <div className="design-footer">
        <span>More visual work</span>

        <a href="#contact">
          Request the design portfolio
          <ArrowUpRight size={16} />
        </a>
      </div>
    </section>
  )
}

export default DesignGallery
