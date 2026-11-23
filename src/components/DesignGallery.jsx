import { useEffect, useState } from 'react'
import { ArrowUpRight, X, ChevronLeft, ChevronRight } from 'lucide-react'
import './DesignGallery.css'

const designs = [
  {
    id: 'smart',
    number: '01',
    title: 'We Work Smart Not Hard',
    category: 'Motivational Graphics',
    description: 'A bold motivational social graphic using strong typography, dramatic imagery and a black-and-neon-green palette.',
    image: '/images/designs/we-work-smart.jpg',
    alt: 'Black and neon-green We Work Smart Not Hard motivational graphic',
  },
  {
    id: 'gtech',
    number: '02',
    title: 'GTECH Phone Repair',
    category: 'Business Flyers',
    description: 'A promotional flyer presenting phone repair services, accessories and business contact information.',
    image: '/images/designs/gtech-phone-repair.jpg',
    alt: 'Green GTECH phone repair and accessories promotional flyer',
  },
  {
    id: 'personal',
    number: '03',
    title: 'Bless Kaundah',
    category: 'Personal Branding',
    description: 'A personal-brand banner highlighting graphic design and web development in a dark, neon-lit visual style.',
    image: '/images/designs/bless-kaundah-banner.jpg',
    alt: 'Bless Kaundah personal branding banner for graphic design and web development',
  },
]

function DesignGallery() {
  const [activeIndex, setActiveIndex] = useState(null)
  const activeDesign = activeIndex === null ? null : designs[activeIndex]

  const closePreview = () => setActiveIndex(null)
  const showPrevious = () => {
    setActiveIndex((current) => (current === null ? null : (current + designs.length - 1) % designs.length))
  }
  const showNext = () => {
    setActiveIndex((current) => (current === null ? null : (current + 1) % designs.length))
  }

  useEffect(() => {
    if (activeIndex === null) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setActiveIndex(null)
      if (event.key === 'ArrowLeft') {
        setActiveIndex((current) => current === null ? null : (current + designs.length - 1) % designs.length)
      }
      if (event.key === 'ArrowRight') {
        setActiveIndex((current) => current === null ? null : (current + 1) % designs.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex])

  return (
    <section className="section design-section design-gallery-v2" id="design">
      <div className="section-heading">
        <span className="section-eyebrow">GRAPHIC DESIGN PORTFOLIO</span>
        <h2>Designs that <span>make an impression.</span></h2>
        <p>A selection of graphic design, promotional and personal-branding work.</p>
      </div>

      <div className="design-gallery-v2-grid">
        {designs.map((design, index) => (
          <article className="design-gallery-v2-card" key={design.id}>
            <button
              className="design-gallery-v2-image-button"
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View ${design.title} design`}
            >
              <img src={design.image} alt={design.alt} loading="lazy" decoding="async" />
              <span className="design-gallery-v2-view">View design <ArrowUpRight size={17} /></span>
            </button>
            <div className="design-gallery-v2-meta">
              <span className="design-gallery-v2-number">{design.number}</span>
              <div className="design-gallery-v2-copy">
                <h3>{design.title}</h3>
                <p>{design.category}</p>
              </div>
              <button
                className="design-gallery-v2-open"
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Open ${design.title}`}
              >
                <ArrowUpRight size={19} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="design-gallery-v2-footer">
        <p>Have a design in mind? Let's bring it to life.</p>
        <a className="design-gallery-v2-cta" href="/signin">
          Start a Design Project <ArrowUpRight size={18} />
        </a>
      </div>

      {activeDesign && (
        <div
          className="design-gallery-v2-lightbox"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePreview()
          }}
        >
          <div className="design-gallery-v2-dialog" role="dialog" aria-modal="true" aria-label={`${activeDesign.title} preview`}>
            <button className="design-gallery-v2-close" type="button" onClick={closePreview} aria-label="Close preview">
              <X size={22} />
            </button>
            <button className="design-gallery-v2-prev" type="button" onClick={showPrevious} aria-label="Previous design">
              <ChevronLeft size={25} />
            </button>
            <img className="design-gallery-v2-full-image" src={activeDesign.image} alt={activeDesign.alt} />
            <button className="design-gallery-v2-next" type="button" onClick={showNext} aria-label="Next design">
              <ChevronRight size={25} />
            </button>
            <div className="design-gallery-v2-lightbox-caption">
              <div>
                <span>{activeDesign.category}</span>
                <h3>{activeDesign.title}</h3>
                <p>{activeDesign.description}</p>
              </div>
              <span className="design-gallery-v2-counter">{String(activeIndex + 1).padStart(2, '0')} / {String(designs.length).padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default DesignGallery
