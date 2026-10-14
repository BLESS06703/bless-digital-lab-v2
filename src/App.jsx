import { lazy, Suspense, useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Services from './components/Services'
import Projects from './components/Projects'
import Skills from './components/Skills'
import DesignGallery from './components/DesignGallery'
import QuoteEstimator from './components/QuoteEstimator'
import Contact from './components/Contact'
import Footer from './components/Footer'
const ClientAuth = lazy(() => import('./pages/ClientAuth'))
const ClientDashboard = lazy(() => import('./pages/ClientDashboard'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))

function PageLoading() {
  return (
    <div
      role="status"
      style={{
        minHeight: '60vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
      }}
    >
      Loading page...
    </div>
  )
}

function App() {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const updatePath = () => setPath(window.location.pathname)
    window.addEventListener('popstate', updatePath)
    return () => window.removeEventListener('popstate', updatePath)
  }, [])

  const normalizedPath = path.replace(/\/+$/, '') || '/'

  if (normalizedPath === '/admin-login') {
    return (
      <Suspense fallback={<PageLoading />}>
        <AdminLogin />
      </Suspense>
    )
  }

  if (normalizedPath === '/admin') {
    return (
      <Suspense fallback={<PageLoading />}>
        <AdminDashboard />
      </Suspense>
    )
  }

  if (normalizedPath === '/account') {
    return (
      <Suspense fallback={<PageLoading />}>
        <ClientDashboard />
      </Suspense>
    )
  }

  if (
    normalizedPath === '/signin' ||
    normalizedPath === '/register' ||
    normalizedPath === '/reset-password'
  ) {
    return (
      <Suspense fallback={<PageLoading />}>
        <ClientAuth />
      </Suspense>
    )
  }

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Projects />
        <Skills />
        <DesignGallery />
        <QuoteEstimator />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App
