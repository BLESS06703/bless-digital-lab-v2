import { useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  reload,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import { auth } from '../lib/firebase'
import './AdminLogin.css'

const OWNER_EMAIL = 'blessingskaunda36@gmail.com'

export default function AdminLogin() {
  const [email, setEmail] = useState(OWNER_EMAIL)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [checking, setChecking] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      if (!currentUser) {
        if (active) setChecking(false)
        return
      }

      try {
        await reload(currentUser)

        const isOwner =
          currentUser.email?.toLowerCase() === OWNER_EMAIL &&
          currentUser.emailVerified

        if (isOwner) {
          await currentUser.getIdToken(true)
          if (active) window.location.replace('/admin')
          return
        }
      } catch (err) {
        console.error('Could not refresh the admin session:', err)
      }

      if (active) setChecking(false)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const friendlyError = err => {
    if (
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/wrong-password' ||
      err.code === 'auth/user-not-found'
    ) {
      return 'Incorrect email or password.'
    }

    if (err.code === 'auth/too-many-requests') {
      return 'Too many attempts. Please wait before trying again.'
    }

    if (err.code === 'auth/network-request-failed') {
      return 'Network error. Check your internet connection.'
    }

    return err.message || 'Sign-in failed. Please try again.'
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const cleanEmail = email.trim().toLowerCase()

      if (cleanEmail !== OWNER_EMAIL) {
        throw new Error('This login is reserved for the authorized administrator.')
      }

      const credential = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password,
      )

      await reload(credential.user)
      await credential.user.getIdToken(true)

      const isOwner =
        credential.user.email?.toLowerCase() === OWNER_EMAIL &&
        credential.user.emailVerified

      if (!isOwner) {
        await signOut(auth)
        throw new Error(
          'Administrator access requires the verified owner account. Verify your email and try again.',
        )
      }

      window.location.replace('/admin')
    } catch (err) {
      setError(friendlyError(err))
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <main className="admin-login-page">
        <div className="admin-login-loading">Checking secure session...</div>
      </main>
    )
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <a className="admin-login-brand" href="/">
          <span className="admin-login-mark">B.</span>
          <span>
            BLESS DIGITAL LAB
            <small>OWNER CONTROL PANEL</small>
          </span>
        </a>

        <div className="admin-login-emblem">
          <ShieldCheck size={30} strokeWidth={1.7} />
        </div>

        <p className="admin-login-eyebrow">RESTRICTED ACCESS</p>
        <h1>Welcome back.</h1>
        <p className="admin-login-subtitle">
          Sign in with your administrator account to manage client requests,
          quotations and projects.
        </p>

        {error && (
          <div className="admin-login-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-email">Administrator email</label>
          <div className="admin-login-input-wrap">
            <Mail size={18} aria-hidden="true" />
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              autoComplete="username"
              required
              disabled={loading}
            />
          </div>

          <label htmlFor="admin-password">Password</label>
          <div className="admin-login-input-wrap">
            <LockKeyhole size={18} aria-hidden="true" />
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={event => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
            <button
              className="admin-login-toggle"
              type="button"
              onClick={() => setShowPassword(value => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={loading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            className="admin-login-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign in to Admin'}
            {!loading && <ShieldCheck size={18} />}
          </button>
        </form>

        <div className="admin-login-security">
          <LockKeyhole size={15} />
          <span>Protected by Firebase Authentication</span>
        </div>

        <a className="admin-login-back" href="/">
          <ArrowLeft size={16} />
          Back to public portfolio
        </a>
      </section>

      <p className="admin-login-footer">
        BLESS DIGITAL LAB · WEB DEVELOPMENT &amp; GRAPHIC DESIGN
      </p>
    </main>
  )
}
