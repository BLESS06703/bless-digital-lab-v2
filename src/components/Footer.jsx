import { ArrowUpRight } from 'lucide-react'

const footerLinks = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Work', href: '#work' },
  { label: 'Design', href: '#design' },
  { label: 'Quote', href: '#quote' },
  { label: 'Contact', href: '#contact' },
]

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <a href="#home" className="footer-logo">
            <span>B</span>
            <strong>
              BLESS
              <small>DIGITAL LAB</small>
            </strong>
          </a>

          <p>
            Web development, application development and graphic design for
            ideas that deserve to become real.
          </p>
        </div>

        <nav className="footer-nav" aria-label="Footer navigation">
          <span>Explore</span>

          {footerLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="footer-contact">
          <span>Let's connect</span>

          <a href="mailto:blessingskaunda36@gmail.com">
            Email
            <ArrowUpRight size={15} />
          </a>

          <a
            href="https://wa.me/265892477118"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
            <ArrowUpRight size={15} />
          </a>

          <a
            href="https://www.instagram.com/bless.kaundah0/"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
            <ArrowUpRight size={15} />
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Bless Digital Lab</span>
        <span>Built with design × code</span>
      </div>
    </footer>
  )
}

export default Footer
