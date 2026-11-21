import { ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import { FaGithub, FaInstagram, FaFacebook } from "react-icons/fa";

const contacts = [
  {
    label: "WhatsApp",
    value: "+265 892 477 118",
    href: "https://wa.me/265892477118",
    icon: MessageCircle,
  },
  {
    label: "Email",
    value: "blessingskaunda36@gmail.com",
    href: "mailto:blessingskaunda36@gmail.com",
    icon: Mail,
  },
  {
    label: "GitHub",
    value: "BLESS06703",
    href: "https://github.com/BLESS06703",
    icon: FaGithub,
  },
  {
    label: "Instagram",
    value: "@bless.kaunda0",
    href: "https://instagram.com/bless.kaunda0",
    icon: FaInstagram,
  },
  {
    label: "Facebook",
    value: "Bless Kaundah",
    href: null,
    icon: FaFacebook,
  },
];

function Contact() {
  return (
    <section id="contact" className="contact section">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">CONTACT</span>
          <h2>Let's build something meaningful.</h2>
          <p>
            Have a project, business idea, or design request?
            Let's turn your idea into something real.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-intro">
            <span className="contact-kicker">BLESS DIGITAL LAB</span>
            <h3>Good ideas deserve great execution.</h3>
            <p>
              Web development, graphic design, and digital solutions
              built with a focus on clean design, useful functionality,
              and real business needs.
            </p>

            <a
              className="contact-primary"
              href="https://wa.me/265892477118?text=Hello%20Bless%20Digital%20Lab%2C%20I%27d%20like%20to%20discuss%20a%20project."
              target="_blank"
              rel="noopener noreferrer"
            >
              Start a conversation
              <ArrowUpRight size={18} />
            </a>
          </div>

          <div className="contact-list" aria-label="Contact information">
            {contacts.map(({ label, value, href, icon: Icon }) => {
              const content = (
                <>
                  <span className="contact-icon">
                    <Icon size={21} />
                  </span>

                  <span className="contact-details">
                    <small>{label}</small>
                    <strong>{value}</strong>
                  </span>

                  {href && (
                    <ArrowUpRight
                      size={19}
                      className="contact-arrow"
                    />
                  )}
                </>
              );

              return href ? (
                <a
                  className="contact-item"
                  href={href}
                  key={label}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {content}
                </a>
              ) : (
                <div className="contact-item contact-item-static" key={label}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
