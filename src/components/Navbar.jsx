import { useState } from 'react'
import { Menu, X, ArrowUpRight, UserRound } from 'lucide-react'

const links = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Work', href: '#work' },
  { label: 'Design', href: '#design' },
]

function Navbar() {
  const [open, setOpen] = useState(false)

  const closeMenu = () => setOpen(false)

  return (
    <header className="navbar">
      <a className="brand" href="#" onClick={closeMenu}>
        <span className="brand-mark">B</span>
        <span className="brand-name">
          BLESS<span>DIGITAL</span>
        </span>
      </a>

      <nav className={`nav-links ${open ? 'is-open' : ''}`}>
        {links.map((link) => (
          <a key={link.href} href={link.href} onClick={closeMenu}>
            {link.label}
          </a>
        ))}

        <a className="nav-login" href="/signin" onClick={closeMenu}>
          <UserRound size={16} />
          Client Login
        </a>

        <a className="nav-cta" href="/signin" onClick={closeMenu}>
          Start a project
          <ArrowUpRight size={16} />
        </a>
      </nav>

      <button
        className="menu-toggle"
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>
    </header>
  )
}

export default Navbar
