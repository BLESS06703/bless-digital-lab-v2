import { useEffect, useMemo, useState } from 'react'
import {
  addDoc, collection, doc, onSnapshot, serverTimestamp, updateDoc,
} from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
  Activity, ArrowUpRight, BriefcaseBusiness, CheckCircle2,
  CircleDollarSign, FileText, LayoutDashboard, LogOut,
  Menu, Plus, RefreshCw, ShieldCheck, Wallet, X,
} from 'lucide-react'
import { auth, db } from '../lib/firebase'
import NotificationCenter from '../components/NotificationCenter'
import './ClientDashboard.css'

const sections = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'projects', label: 'My projects', icon: BriefcaseBusiness },
  { id: 'quotes', label: 'Quotes', icon: FileText },
  { id: 'invoices', label: 'Invoices', icon: Wallet },
]

const money = value =>
  new Intl.NumberFormat('en-MW', {
    style: 'currency',
    currency: 'MWK',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)

const date = value => {
  if (!value) return 'Not set'
  const d = value?.toDate ? value.toDate() : new Date(value)
  return Number.isNaN(d.getTime())
    ? 'Not set'
    : d.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
}

const statusClass = value =>
  String(value || 'Pending').toLowerCase().replace(/[^a-z0-9]+/g, '-')

const canRespondToQuote = quote => {
  if (quote.status !== 'Sent') return false

  const value = quote.validUntil || quote.expiryDate
  if (!value) return false

  const expiry = value?.toDate ? value.toDate() : new Date(value)
  return !Number.isNaN(expiry.getTime()) && expiry.getTime() > Date.now()
}

function Status({ value }) {
  return <span className={`client-status ${statusClass(value)}`}>
    {value || 'Pending'}
  </span>
}

function Empty({ title, description }) {
  return <div className="client-empty">
    <FileText size={25} />
    <strong>{title}</strong>
    <p>{description}</p>
  </div>
}

export default function ClientDashboard() {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [section, setSection] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => {
    if (!mobileMenu) return

    const closeOnEscape = event => {
      if (event.key === 'Escape') setMobileMenu(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileMenu])
  const [projects, setProjects] = useState([])
  const [quotes, setQuotes] = useState([])
  const [invoices, setInvoices] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')
  const [respondingQuoteId, setRespondingQuoteId] = useState('')
  const [form, setForm] = useState({
    service: 'Website development',
    budget: '',
    details: '',
    deadline: '',
  })

  useEffect(() => {
    return onAuthStateChanged(auth, currentUser => {
      setUser(currentUser)
      setAuthReady(true)

      if (!currentUser) {
        window.location.replace('/signin')
      }
    })
  }, [])

  useEffect(() => {
    if (!user) return

    const paths = [
      ['projects', setProjects],
      ['quotes', setQuotes],
      ['invoices', setInvoices],
      ['quoteRequests', setRequests],
    ]

    const loadedCollections = new Set()
    const finishCollection = name => {
      loadedCollections.add(name)
      if (loadedCollections.size === paths.length) setLoading(false)
    }

    const unsubscribers = paths.map(([name, setter]) =>
      onSnapshot(
        collection(db, 'users', user.uid, name),
        snapshot => {
          setter(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
          finishCollection(name)
        },
        err => {
          console.error(`Firestore ${name} error:`, err)
          setError(
            'Some portal data could not be loaded. Check that Firestore is enabled and its security rules are published.'
          )
          finishCollection(name)
        }
      )
    )

    return () => unsubscribers.forEach(unsubscribe => unsubscribe())
  }, [user])

  const notificationItems = useMemo(() => [
    ...quotes.map(item => ({
      id: `quote-${item.id}-${item.status || 'updated'}`,
      title: item.status === 'Accepted' ? 'Quote accepted' : item.status === 'Declined' ? 'Quote declined' : 'Quote update',
      message: `${item.title || item.service || 'Your quote'} — ${item.status || 'Updated'}`,
      createdAt: item.updatedAt || item.respondedAt || item.createdAt,
    })),
    ...requests.map(item => ({
      id: `request-${item.id}-${item.status || 'updated'}`,
      title: item.status === 'Quote issued' ? 'Quote issued' : 'Quote request update',
      message: `${item.service || 'Service request'} — ${item.status || 'Updated'}`,
      createdAt: item.updatedAt || item.createdAt,
    })),
    ...projects.map(item => ({
      id: `project-${item.id}-${item.status || 'updated'}`,
      title: 'Project update',
      message: `${item.title || item.name || 'Your project'} — ${item.status || 'Updated'}`,
      createdAt: item.updatedAt || item.createdAt,
    })),
    ...invoices.map(item => ({
      id: `invoice-${item.id}-${item.status || 'updated'}`,
      title: 'Invoice update',
      message: `${item.title || item.invoiceNumber || 'Your invoice'} — ${item.status || 'Updated'}`,
      createdAt: item.updatedAt || item.createdAt,
    })),
  ], [quotes, requests, projects, invoices])

  const totals = useMemo(() => ({
    active: projects.filter(p =>
      ['active', 'in progress', 'in-progress'].includes(
        String(p.status || '').toLowerCase()
      )
    ).length,
    pendingQuotes: quotes.filter(q =>
      ['pending', 'sent', 'awaiting approval'].includes(
        String(q.status || '').toLowerCase()
      )
    ).length,
    outstanding: invoices
      .filter(i => !['paid', 'cancelled'].includes(
        String(i.status || '').toLowerCase()
      ))
      .reduce((sum, i) => sum + Number(i.amount || i.total || 0), 0),
  }), [projects, quotes, invoices])

  const query = searchQuery.trim().toLowerCase()
  const matches = (...values) =>
    values.some(value => String(value ?? '').toLowerCase().includes(query))

  const filteredProjects = projects.filter(project =>
    !query || matches(
      project.name, project.title, project.description, project.status
    )
  )

  const filteredQuotes = quotes.filter(quote =>
    !query || matches(
      quote.title, quote.service, quote.quoteNumber,
      quote.description, quote.status
    )
  )

  const filteredRequests = requests.filter(request =>
    !query || matches(
      request.service, request.details, request.status,
      request.clientName, request.clientEmail
    )
  )

  const filteredInvoices = invoices.filter(invoice =>
    !query || matches(
      invoice.invoiceNumber, invoice.title, invoice.description,
      invoice.status, invoice.id
    )
  )

  async function submitRequest(event) {
    event.preventDefault()
    if (!user || submitting) return

    if (form.details.trim().length < 10) {
      setError('Please describe your project in at least 10 characters.')
      return
    }

    setSubmitting(true)
    setError('')
    setNotice('')

    try {
      await addDoc(
        collection(db, 'users', user.uid, 'quoteRequests'),
        {
          service: form.service,
          budget: form.budget === '' ? null : Number(form.budget),
          details: form.details.trim(),
          deadline: form.deadline || null,
          status: 'Pending review',
          clientName: user.displayName || '',
          clientEmail: user.email || '',
          createdAt: serverTimestamp(),
        }
      )

      setForm({
        service: 'Website development',
        budget: '',
        details: '',
        deadline: '',
      })
      setFormOpen(false)
      setSection('quotes')
      setNotice('Quote request submitted successfully. It is awaiting review.')
    } catch (err) {
      console.error(err)
      setError('Could not submit your request. Check your connection and Firestore rules, then try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function respondToQuote(quote, response) {
    if (!user || respondingQuoteId) return
    if (!['Accepted', 'Declined'].includes(response)) return

    if (!canRespondToQuote(quote)) {
      setError('This quotation is no longer available for a response.')
      return
    }

    setRespondingQuoteId(quote.id)
    setError('')
    setNotice('')

    try {
      await updateDoc(
        doc(db, 'users', user.uid, 'quotes', quote.id),
        {
          status: response,
          respondedAt: serverTimestamp(),
        }
      )

      setNotice(
        response === 'Accepted'
          ? 'Quotation accepted successfully.'
          : 'Quotation declined.'
      )
    } catch (err) {
      console.error('Quote response failed:', err)
      setError(
        err.code === 'permission-denied'
          ? 'Your response was blocked by Firestore rules. Publish the client quote-response rules before trying again.'
          : 'Could not submit your response. Please check your connection and try again.'
      )
    } finally {
      setRespondingQuoteId('')
    }
  }

  async function logout() {
    try {
      await signOut(auth)
      window.location.replace('/signin')
    } catch {
      setError('Sign out failed. Please try again.')
    }
  }

  if (!authReady || !user) {
    return <div className="client-loading"><RefreshCw className="spin" /> Loading your account…</div>
  }

  const title = sections.find(item => item.id === section)?.label || 'Overview'

  return (
    <div className="client-portal">
      <aside id="client-sidebar" className={`client-sidebar ${mobileMenu ? 'mobile-open' : ''}`} aria-label="Client navigation">
        <a href="/" className="client-brand">
          <span className="client-brand-mark">B</span>
          <span>Bless Digital Lab<small>CLIENT PORTAL</small></span>
        </a>

        <div className="client-side-label">WORKSPACE</div>
        <nav className="client-nav">
          {sections.map(item => {
            const Icon = item.icon
            return <button
              key={item.id}
              className={section === item.id ? 'active' : ''}
              onClick={() => {
                setSection(item.id)
                setMobileMenu(false)
                setNotice('')
              }}
            >
              <Icon size={18} /> {item.label}
            </button>
          })}
        </nav>

        <div className="client-sidebar-bottom">
          <div className="client-profile">
            <div className="client-avatar">
              {(user.displayName || user.email || 'C').charAt(0).toUpperCase()}
            </div>
            <div className="client-profile-text">
              <strong>{user.displayName || 'Client account'}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <button className="client-logout" onClick={logout}>
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>

      {mobileMenu && <button type="button" className="client-scrim" onClick={() => setMobileMenu(false)} aria-label="Close navigation menu" />}

      <main className="client-main">
        <header className="client-topbar">
          <button
            type="button"
            className="client-menu-button"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label={mobileMenu ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenu}
            aria-controls="client-sidebar"
          >
            {mobileMenu ? <X size={21} /> : <Menu size={21} />}
          </button>
          <div>
            <span className="client-eyebrow">BLESS DIGITAL LAB / CLIENT AREA</span>
            <h1>{title}</h1>
          </div>
          <label
            className="client-search"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginInline: 'auto',
              maxWidth: '280px',
              width: '100%',
            }}
          >
            <span className="sr-only">Search current dashboard section</span>
            <input
              type="search"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder={`Search ${section === 'overview' ? 'your workspace' : title.toLowerCase()}…`}
              aria-label="Search dashboard records"
              style={{
                width: '100%',
                minWidth: 0,
                padding: '0.65rem 0.8rem',
                border: '1px solid var(--border, #d1d5db)',
                borderRadius: '10px',
                background: 'var(--surface, #fff)',
                color: 'inherit',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                style={{ padding: '0.4rem', flexShrink: 0 }}
              >
                <X size={17} />
              </button>
            )}
          </label>
          <NotificationCenter key={user.uid} userKey={user.uid} items={notificationItems} />
          <a className="client-public-link" href="/">View website <ArrowUpRight size={16} /></a>
        </header>

        <div className="client-content">
          {error && <div className="client-alert error">{error}</div>}
          {notice && <div className="client-alert success"><CheckCircle2 size={18} />{notice}</div>}

          {!user.emailVerified && <div className="client-alert warning">
            <ShieldCheck size={19} />
            Your email is not verified yet. Verify it before sharing sensitive account information.
          </div>}

          {loading && <div className="client-loading"><RefreshCw className="spin" /> Syncing portal data…</div>}

          {section === 'overview' && <>
            <div className="client-welcome">
              <div>
                <span>YOUR WORKSPACE</span>
                <h2>Welcome back, {(user.displayName || 'Client').split(' ')[0]}.</h2>
                <p>Track your work, review quotes and keep your projects moving.</p>
              </div>
              <button className="client-primary" onClick={() => setFormOpen(true)}>
                <Plus size={18} /> Request a quote
              </button>
            </div>

            <div className="client-stats">
              <div className="client-stat">
                <span><BriefcaseBusiness size={18} /> Active projects</span>
                <strong>{totals.active}</strong>
                <small>Currently in progress</small>
              </div>
              <div className="client-stat">
                <span><FileText size={18} /> Pending quotes</span>
                <strong>{totals.pendingQuotes + requests.filter(r =>
                  ['pending', 'pending review'].includes(String(r.status || '').toLowerCase())
                ).length}</strong>
                <small>Awaiting your review or our response</small>
              </div>
              <div className="client-stat">
                <span><CircleDollarSign size={18} /> Outstanding</span>
                <strong>{money(totals.outstanding)}</strong>
                <small>Unpaid invoice balances</small>
              </div>
            </div>

            <div className="client-section-heading">
              <div><span>PROJECT TRACKING</span><h3>Recent projects</h3></div>
              <button className="client-text-button" onClick={() => setSection('projects')}>View all <ArrowUpRight size={15} /></button>
            </div>

            {projects.length === 0 && !loading
              ? <Empty title="Your projects will appear here" description="Once a project is assigned to your account, its status and progress will appear in this space." />
              : filteredProjects.length === 0 && query
                ? <Empty title="No matching projects" description="Try a different search term to find your projects." />
                : <div className="client-card-list">
                {filteredProjects.slice(0, 3).map(project => <article className="client-record" key={project.id}>
                  <div className="client-record-icon"><BriefcaseBusiness size={20} /></div>
                  <div className="client-record-body">
                    <strong>{project.name || project.title || 'Untitled project'}</strong>
                    <p>{project.description || 'No project description provided.'}</p>
                    <div className="client-progress"><span style={{ width: `${Math.max(0, Math.min(100, Number(project.progress) || 0))}%` }} /></div>
                    <small>{Math.max(0, Math.min(100, Number(project.progress) || 0))}% complete</small>
                  </div>
                  <Status value={project.status} />
                </article>)}
              </div>}

            <div className="client-section-heading">
              <div><span>FINANCIAL OVERVIEW</span><h3>Recent invoices</h3></div>
              <button className="client-text-button" onClick={() => setSection('invoices')}>View all <ArrowUpRight size={15} /></button>
            </div>
            {invoices.length === 0 && !loading
              ? <Empty title="No invoices yet" description="When an invoice is issued for your work, you will find it here." />
              : filteredInvoices.length === 0 && query
                ? <Empty title="No matching invoices" description="Try a different search term to find your invoices." />
                : <InvoiceTable invoices={filteredInvoices.slice(0, 3)} />}
          </>}

          {section === 'projects' && <>
            <div className="client-page-intro">
              <div><h2>My projects</h2><p>Follow progress, milestones and delivery dates for your work.</p></div>
            </div>
            {projects.length === 0 && !loading
              ? <Empty title="No projects assigned yet" description="Your project list will update here when the team assigns work to your account." />
              : filteredProjects.length === 0 && query
                ? <Empty title="No matching projects" description="Try a different search term to find your projects." />
                : <div className="client-project-grid">{filteredProjects.map(project => <article className="client-project-card" key={project.id}>
                <div className="client-project-top"><BriefcaseBusiness size={20} /><Status value={project.status} /></div>
                <h3>{project.name || project.title || 'Untitled project'}</h3>
                <p>{project.description || 'No description provided.'}</p>
                <div className="client-progress"><span style={{ width: `${Math.max(0, Math.min(100, Number(project.progress) || 0))}%` }} /></div>
                <div className="client-project-meta"><span>{Math.max(0, Math.min(100, Number(project.progress) || 0))}% complete</span><span>Due {date(project.deadline)}</span></div>
              </article>)}</div>}
          </>}

          {section === 'quotes' && <>
            <div className="client-page-intro">
              <div><h2>Quotes & requests</h2><p>Review issued quotes and follow the status of your requests.</p></div>
              <button className="client-primary" onClick={() => setFormOpen(true)}><Plus size={18} /> New request</button>
            </div>
            <h3 className="client-subheading">Issued quotes</h3>
            {quotes.length === 0 && !loading
              ? <Empty title="No quotes issued yet" description="Approved quote documents and prices from the team will appear here." />
              : filteredQuotes.length === 0 && query
                ? <Empty title="No matching quotes" description="Try a different search term to find your quotes." />
                : <div className="client-table-wrap"><table className="client-table">
                <thead><tr><th>Quote</th><th>Amount</th><th>Valid until</th><th>Status</th><th>Response</th></tr></thead>
                <tbody>{filteredQuotes.map(q => <tr key={q.id}>
                  <td><strong>{q.title || q.service || q.quoteNumber || 'Service quote'}</strong><small>{q.description || q.quoteNumber || q.id}</small></td>
                  <td>{money(q.amount ?? q.total)}</td>
                  <td>{date(q.validUntil || q.expiryDate)}</td>
                  <td><Status value={q.status} /></td>
                  <td>
                    {canRespondToQuote(q) ? <div className="client-quote-actions">
                      <button
                        type="button"
                        className="client-primary"
                        disabled={Boolean(respondingQuoteId)}
                        onClick={() => respondToQuote(q, 'Accepted')}
                      >
                        {respondingQuoteId === q.id ? 'Saving…' : 'Accept'}
                      </button>
                      <button
                        type="button"
                        className="client-text-button"
                        disabled={Boolean(respondingQuoteId)}
                        onClick={() => respondToQuote(q, 'Declined')}
                      >
                        Decline
                      </button>
                    </div> : <span className="client-quote-response">
                      {q.status === 'Sent' ? 'Expired or unavailable' : 'Response recorded'}
                    </span>}
                  </td>
                </tr>)}</tbody>
              </table></div>}

            <h3 className="client-subheading">My requests</h3>
            {requests.length === 0 && !loading
              ? <Empty title="No quote requests" description="Submit a request and the team can review your requirements." />
              : filteredRequests.length === 0 && query
                ? <Empty title="No matching requests" description="Try a different search term to find your requests." />
                : <div className="client-table-wrap"><table className="client-table">
                <thead><tr><th>Service</th><th>Budget</th><th>Submitted</th><th>Status</th></tr></thead>
                <tbody>{filteredRequests.map(r => <tr key={r.id}>
                  <td><strong>{r.service || 'Custom service'}</strong><small>{r.details || ''}</small></td>
                  <td>{r.budget == null ? 'Not specified' : money(r.budget)}</td>
                  <td>{date(r.createdAt)}</td><td><Status value={r.status} /></td>
                </tr>)}</tbody>
              </table></div>}
          </>}

          {section === 'invoices' && <>
            <div className="client-page-intro">
              <div><h2>Invoices</h2><p>Review billing amounts, due dates and payment status.</p></div>
            </div>
            <div className="client-invoice-total"><span><Wallet size={19} /> Total outstanding</span><strong>{money(totals.outstanding)}</strong></div>
            {invoices.length === 0 && !loading
              ? <Empty title="No invoices yet" description="Your invoices will be listed here when the team issues them." />
              : filteredInvoices.length === 0 && query
                ? <Empty title="No matching invoices" description="Try a different search term to find your invoices." />
                : <InvoiceTable invoices={filteredInvoices} />}
            <p className="client-note">Payments are not processed inside this portal yet. Contact Bless Digital Lab to confirm payment instructions and receipts.</p>
          </>}

          <footer className="client-footer">
            <span>© {new Date().getFullYear()} Bless Digital Lab</span>
            <span><Activity size={14} /> Client workspace</span>
          </footer>
        </div>
      </main>

      {formOpen && <div className="client-modal-backdrop" onClick={() => !submitting && setFormOpen(false)}>
        <section className="client-modal" role="dialog" aria-modal="true" aria-labelledby="quote-modal-title" onClick={e => e.stopPropagation()}>
          <div className="client-modal-heading">
            <div><span>START A PROJECT</span><h2 id="quote-modal-title">Request a quote</h2></div>
            <button className="client-icon-button" onClick={() => setFormOpen(false)} disabled={submitting} aria-label="Close"><X size={20} /></button>
          </div>
          <p>Tell us what you need. Your request will be saved privately to your client account for review.</p>
          <form onSubmit={submitRequest} className="client-form">
            <label>Service
              <select value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
                <option>Website development</option>
                <option>Full-stack web application</option>
                <option>Android application</option>
                <option>Graphic design</option>
                <option>Logo and branding</option>
                <option>Website maintenance</option>
                <option>Other / custom project</option>
              </select>
            </label>
            <label>Budget in MWK (optional)
              <input type="number" min="0" step="1" placeholder="e.g. 150000" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
            </label>
            <label>Project requirements
              <textarea required minLength={10} rows={5} placeholder="Describe the project, key features and what you want delivered…" value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} />
            </label>
            <label>Preferred deadline (optional)
              <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </label>
            {error && <div className="client-alert error">{error}</div>}
            <button className="client-primary client-submit" type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit quote request'} <ArrowUpRight size={17} />
            </button>
          </form>
        </section>
      </div>}
    </div>
  )
}

function InvoiceTable({ invoices }) {
  return <div className="client-table-wrap"><table className="client-table">
    <thead><tr><th>Invoice</th><th>Amount</th><th>Due date</th><th>Status</th></tr></thead>
    <tbody>{invoices.map(invoice => <tr key={invoice.id}>
      <td><strong>{invoice.invoiceNumber || invoice.title || `Invoice ${invoice.id.slice(0, 6)}`}</strong><small>{invoice.description || 'Bless Digital Lab service'}</small></td>
      <td>{money(invoice.amount ?? invoice.total)}</td>
      <td>{date(invoice.dueDate)}</td>
      <td><Status value={invoice.status} /></td>
    </tr>)}</tbody>
  </table></div>
}
