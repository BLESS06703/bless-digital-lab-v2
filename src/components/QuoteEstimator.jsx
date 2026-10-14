import { useMemo, useState } from 'react'
import {
  Check,
  Clock3,
  MessageCircle,
} from 'lucide-react'
import { services } from '../data/services'

const EXPRESS_FEE = 50000

function formatMWK(amount) {
  return new Intl.NumberFormat('en-MW').format(amount)
}

function QuoteEstimator() {
  const [selected, setSelected] = useState([])
  const [express, setExpress] = useState(false)

  const total = useMemo(() => {
    const servicesTotal = selected.reduce((sum, id) => {
      const service = services.find((item) => item.id === id)
      return sum + (service?.price || 0)
    }, 0)

    return servicesTotal + (express ? EXPRESS_FEE : 0)
  }, [selected, express])

  const toggleService = (id) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  const createWhatsAppMessage = () => {
    const selectedServices = services
      .filter((service) => selected.includes(service.id))
      .map((service) => `• ${service.name} — MWK ${formatMWK(service.price)}`)
      .join('\n')

    const expressLine = express
      ? `\n• Express delivery — MWK ${formatMWK(EXPRESS_FEE)}`
      : ''

    const message = [
      'Hello Bless Digital Lab!',
      '',
      'I would like to request a project quotation.',
      '',
      'Selected services:',
      selectedServices || '• No service selected yet',
      expressLine,
      '',
      `Estimated total: MWK ${formatMWK(total)}`,
      '',
      'I would like to discuss the project details.',
    ].join('\n')

    return `https://wa.me/265892477118?text=${encodeURIComponent(message)}`
  }

  return (
    <section className="section quote-section" id="quote">
      <div className="section-heading">
        <span className="section-number">06</span>
        <span className="section-label">Start a project</span>
      </div>

      <div className="quote-intro">
        <div>
          <h2>
            Let's build
            <span>something useful.</span>
          </h2>
        </div>

        <p>
          Select the services you need to get a quick starting estimate.
          Final pricing can be adjusted after discussing your exact project
          requirements.
        </p>
      </div>

      <div className="quote-layout">
        <div className="quote-options">
          <div className="quote-label">
            <span>01</span>
            Choose your services
          </div>

          <div className="service-options">
            {services.map((service) => {
              const active = selected.includes(service.id)

              return (
                <button
                  key={service.id}
                  type="button"
                  className={`quote-option ${active ? 'active' : ''}`}
                  onClick={() => toggleService(service.id)}
                >
                  <span className="option-check">
                    {active && <Check size={14} />}
                  </span>

                  <span className="option-info">
                    <strong>{service.name}</strong>
                    <small>{service.description}</small>
                  </span>

                  <span className="option-price">
                    MWK {formatMWK(service.price)}
                  </span>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            className={`express-option ${express ? 'active' : ''}`}
            onClick={() => setExpress((value) => !value)}
          >
            <span className="option-check">
              {express && <Check size={14} />}
            </span>

            <span className="option-info">
              <strong>Express delivery</strong>
              <small>Priority project delivery</small>
            </span>

            <span className="option-price">
              + MWK {formatMWK(EXPRESS_FEE)}
            </span>

            <Clock3 size={17} />
          </button>
        </div>

        <aside className="quote-summary">
          <span className="summary-label">Estimated investment</span>

          <div className="summary-total">
            <small>MWK</small>
            <strong>{formatMWK(total)}</strong>
          </div>

          <div className="summary-line" />

          <div className="summary-meta">
            <span>Selected services</span>
            <strong>{selected.length}</strong>
          </div>

          <div className="summary-meta">
            <span>Express delivery</span>
            <strong>{express ? 'Yes' : 'No'}</strong>
          </div>

          <p>
            This is an initial estimate. The final quotation depends on the
            scope, complexity and requirements of the project.
          </p>

          <a
            className="quote-button"
            href={createWhatsAppMessage()}
            target="_blank"
            rel="noreferrer"
          >
            Discuss this project
            <MessageCircle size={18} />
          </a>
        </aside>
      </div>
    </section>
  )
}

export default QuoteEstimator
