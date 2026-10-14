import {
  ArrowUpRight,
  Code2,
  Smartphone,
  Palette,
  Globe,
} from 'lucide-react'

const services = [
  {
    number: '01',
    icon: Globe,
    title: 'Web Development',
    description:
      'Responsive websites and modern web experiences designed around your brand, audience and goals.',
  },
  {
    number: '02',
    icon: Smartphone,
    title: 'Application Development',
    description:
      'Practical mobile and web applications that solve real problems and turn ideas into usable products.',
  },
  {
    number: '03',
    icon: Palette,
    title: 'Graphic Design',
    description:
      'Visual identities, social graphics and digital designs that give brands a distinctive presence.',
  },
  {
    number: '04',
    icon: Code2,
    title: 'Digital Solutions',
    description:
      'Custom technology solutions that connect design, software and business processes into one system.',
  },
]

function Services() {
  return (
    <section className="section services-section" id="services">
      <div className="section-heading">
        <span className="section-number">02</span>
        <span className="section-label">What we do</span>
      </div>

      <div className="services-intro">
        <h2>
          Design meets
          <span>technology.</span>
        </h2>

        <p>
          Different problems require different tools. Each project starts with
          understanding the problem, then choosing the right combination of
          design and technology to solve it.
        </p>
      </div>

      <div className="services-list">
        {services.map((service) => {
          const Icon = service.icon

          return (
            <article className="service-item" key={service.number}>
              <span className="service-number">{service.number}</span>

              <div className="service-icon">
                <Icon size={22} />
              </div>

              <div className="service-info">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>

              <ArrowUpRight className="service-arrow" size={22} />
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default Services
