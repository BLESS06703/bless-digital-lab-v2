import { useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  signOut,
  reload,
} from 'firebase/auth'
import { auth, db } from '../lib/firebase'
import {
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import {
  LockKeyhole,
  Mail,
  UserRound,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  LogOut,
  RefreshCw,
} from 'lucide-react'
import './ClientAuth.css'

const getMode = () => {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path === '/register') return 'register'
  if (path === '/account') return 'account'
  return 'signin'
}

export default function ClientAuth() {
  const [mode, setMode] = useState(getMode)
  const [user, setUser] = useState(auth.currentUser)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    const handlePopState = () => {
      setMode(getMode())
      setNotice('')
      setError('')
    }

    window.addEventListener('popstate', handlePopState)

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setChecking(false)
    })

    return () => {
      unsubscribe()
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const navigate = (path) => {
    window.history.pushState({}, '', path)
    setMode(getMode())
    setNotice('')
    setError('')
    setPassword('')
    setConfirmPassword('')
  }

  const friendlyError = (err) => {
    const messages = {
      'auth/email-already-in-use': 'An account already exists with this email.',
      'auth/invalid-email': 'Enter a valid email address.',
      'auth/weak-password': 'Use a stronger password with at least 6 characters.',
      'auth/invalid-credential': 'Incorrect email or password.',
      'auth/user-not-found': 'No account was found with this email.',
      'auth/wrong-password': 'Incorrect email or password.',
      'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
      'auth/network-request-failed': 'Network error. Check your internet connection.',
      'auth/operation-not-allowed': 'Email/password sign-in is not enabled in Firebase Console.',
      'auth/unauthorized-domain': 'This domain is not authorized in Firebase Console.',
      'auth/invalid-action-code': 'This verification or reset link is invalid or expired.',
    }

    return messages[err.code] || err.message || 'Something went wrong. Please try again.'
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setLoading(true)

    try {
      const cleanEmail = email.trim()

      if (mode === 'reset') {
        if (!cleanEmail) throw new Error('Enter your email address first.')
        await sendPasswordResetEmail(auth, cleanEmail)
        setNotice('Password reset instructions have been sent if an account exists for that email.')
      } else if (mode === 'register') {
        if (name.trim().length < 2) {
          throw new Error('Enter your full name.')
        }

        if (password.length < 6) {
          throw new Error('Your password must contain at least 6 characters.')
        }

        if (password !== confirmPassword) {
          throw new Error('Your passwords do not match.')
        }

        const credential = await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password,
        )

        await updateProfile(credential.user, {
          displayName: name.trim(),
        })

        // Create the client's Firestore profile.
        await setDoc(doc(db, 'users', credential.user.uid), {
          displayName: name.trim(),
          email: credential.user.email || cleanEmail,
          createdAt: serverTimestamp(),
        })

        await sendEmailVerification(credential.user)
        setUser(credential.user)
        navigate('/account')
        setNotice('Your account has been created. Check your email for the verification link.')
      } else {
        const credential = await signInWithEmailAndPassword(
          auth,
          cleanEmail,
          password,
        )

        setUser(credential.user)
        navigate('/account')
        setNotice(
          credential.user.emailVerified
            ? 'You are signed in successfully.'
            : 'You are signed in. Please verify your email address.',
        )
      }
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  const resendVerification = async () => {
    setError('')
    setNotice('')
    setLoading(true)

    try {
      if (!auth.currentUser) {
        throw new Error('Please sign in again to verify your email.')
      }

      await sendEmailVerification(auth.currentUser)
      setNotice('A new verification email has been sent.')
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  const refreshVerification = async () => {
    setError('')
    setNotice('')
    setLoading(true)

    try {
      if (!auth.currentUser) {
        throw new Error('Please sign in again.')
      }

      await reload(auth.currentUser)
      setUser(auth.currentUser)

      if (auth.currentUser.emailVerified) {
        setNotice('Email verified successfully.')
      } else {
        setNotice('Your email is not verified yet. Open the link in your inbox, then try again.')
      }
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setError('')
    setNotice('')
    setLoading(true)

    try {
      await signOut(auth)
      setUser(null)
      navigate('/signin')
      setNotice('You have signed out successfully.')
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="auth-page">
        <div className="auth-loading">Loading your account...</div>
      </div>
    )
  }

  if (mode === 'account') {
    if (!user) {
      return (
        <div className="auth-page">
          <section className="auth-card">
            <a className="auth-brand" href="/">B<span>.</span> BLESS DIGITAL LAB</a>
            <h1>Sign in to continue</h1>
            <p className="auth-subtitle">Sign in to access your client account.</p>
            <button className="auth-primary" onClick={() => navigate('/signin')}>
              Go to sign in
            </button>
            <a className="auth-back" href="/"> <ArrowLeft size={16} /> Back to portfolio</a>
          </section>
        </div>
      )
    }

    return (
      <div className="auth-page">
        <section className="auth-card auth-account">
          <a className="auth-brand" href="/">B<span>.</span> BLESS DIGITAL LAB</a>
          <div className="auth-account-icon"><ShieldCheck size={30} /></div>
          <p className="auth-eyebrow">CLIENT ACCOUNT</p>
          <h1>Welcome{user.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}.</h1>
          <p className="auth-subtitle">You are signed in with your client account.</p>

          <div className="auth-profile-row">
            <UserRound size={19} />
            <div>
              <small>Full name</small>
              <p>{user.displayName || 'Client'}</p>
            </div>
          </div>

          <div className="auth-profile-row">
            <Mail size={19} />
            <div>
              <small>Email address</small>
              <p>{user.email}</p>
            </div>
          </div>

          <div className={`auth-verification ${user.emailVerified ? 'verified' : ''}`}>
            <span className="auth-status-dot" />
            {user.emailVerified ? 'Email verified' : 'Email not verified'}
          </div>

          {!user.emailVerified && (
            <div className="auth-verification-actions">
              <button className="auth-secondary" disabled={loading} onClick={resendVerification}>
                Resend verification email
              </button>
              <button className="auth-secondary" disabled={loading} onClick={refreshVerification}>
                <RefreshCw size={15} /> Check verification
              </button>
            </div>
          )}

          {notice && <p className="auth-message success" role="status">{notice}</p>}
          {error && <p className="auth-message error" role="alert">{error}</p>}

          <button className="auth-primary" disabled={loading} onClick={handleSignOut}>
            <LogOut size={17} /> {loading ? 'Please wait...' : 'Sign out'}
          </button>

          <a className="auth-back" href="/"> <ArrowLeft size={16} /> Back to portfolio</a>
        </section>
      </div>
    )
  }

  const isRegister = mode === 'register'
  const isReset = mode === 'reset'

  return (
    <div className="auth-page">
      <section className="auth-card">
        <a className="auth-brand" href="/">B<span>.</span> BLESS DIGITAL LAB</a>

        <p className="auth-eyebrow">
          {isReset ? 'ACCOUNT RECOVERY' : isRegister ? 'CLIENT REGISTRATION' : 'CLIENT PORTAL'}
        </p>

        <h1>
          {isReset ? 'Reset password.' : isRegister ? 'Create your account.' : 'Welcome back.'}
        </h1>

        <p className="auth-subtitle">
          {isReset
            ? 'Enter your email and we will send you a password reset link.'
            : isRegister
              ? 'Create an account to get started with Bless Digital Lab.'
              : 'Sign in to access your client account.'}
        </p>

        {notice && <p className="auth-message success" role="status">{notice}</p>}
        {error && <p className="auth-message error" role="alert">{error}</p>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <label className="auth-field">
              <span>Full name</span>
              <div className="auth-input-wrap">
                <UserRound size={18} />
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  minLength={2}
                  required
                />
              </div>
            </label>
          )}

          <label className="auth-field">
            <span>Email address</span>
            <div className="auth-input-wrap">
              <Mail size={18} />
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </label>

          {!isReset && (
            <label className="auth-field">
              <span>Password</span>
              <div className="auth-input-wrap">
                <LockKeyhole size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  placeholder={isRegister ? 'At least 6 characters' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
                <button
                  className="auth-eye"
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
          )}

          {isRegister && (
            <label className="auth-field">
              <span>Confirm password</span>
              <div className="auth-input-wrap">
                <LockKeyhole size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
            </label>
          )}

          {!isRegister && !isReset && (
            <button
              type="button"
              className="auth-text-button auth-forgot"
              onClick={() => navigate('/reset-password')}
            >
              Forgot password?
            </button>
          )}

          <button className="auth-primary" type="submit" disabled={loading}>
            {loading
              ? 'Please wait...'
              : isReset
                ? 'Send reset link'
                : isRegister
                  ? 'Create account'
                  : 'Sign in'}
          </button>
        </form>

        <div className="auth-switch">
          {isReset ? (
            <button className="auth-text-button" onClick={() => navigate('/signin')}>
              Back to sign in
            </button>
          ) : isRegister ? (
            <>
              Already have an account?{' '}
              <button className="auth-text-button" onClick={() => navigate('/signin')}>Sign in</button>
            </>
          ) : (
            <>
              New to Bless Digital Lab?{' '}
              <button className="auth-text-button" onClick={() => navigate('/register')}>Create account</button>
            </>
          )}
        </div>

        <a className="auth-back" href="/"> <ArrowLeft size={16} /> Back to portfolio</a>
      </section>
    </div>
  )
}
