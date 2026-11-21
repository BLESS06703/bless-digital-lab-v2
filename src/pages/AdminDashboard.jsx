import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  collectionGroup,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  doc,
} from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { auth, db } from '../lib/firebase'
import NotificationCenter from '../components/NotificationCenter'
import './AdminDashboard.css'

const OWNER_EMAIL = 'blessingskaunda36@gmail.com'

const money = value =>
  new Intl.NumberFormat('en-MW', {
    style: 'currency',
    currency: 'MWK',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)

const formatDate = value => {
  if (!value) return 'Not set'
  const parsed = value?.toDate ? value.toDate() : new Date(value)
  return Number.isNaN(parsed.getTime())
    ? 'Not set'
    : parsed.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
}

const defaultExpiry = () => {
  const date = new Date()
  date.setDate(date.getDate() + 14)
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

const isPastExpiry = value =>
  new Date(`${value}T23:59:59`).getTime() < Date.now()

export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [amount, setAmount] = useState('')
  const [title, setTitle] = useState('')
  const [expiry, setExpiry] = useState(defaultExpiry)
  const [issuing, setIssuing] = useState(false)
  const [filter, setFilter] = useState('Pending review')
  const [search, setSearch] = useState('')
  const [activeSection, setActiveSection] = useState('overview')

  useEffect(() => onAuthStateChanged(auth, currentUser => {
    setUser(currentUser)
    setAuthReady(true)

    const isOwner =
      currentUser?.email?.toLowerCase() === OWNER_EMAIL &&
      currentUser.emailVerified

    setAuthorized(Boolean(isOwner))

    if (!currentUser || !isOwner) {
      window.location.replace('/admin-login')
    }
  }), [])

  useEffect(() => {
    if (!user || !authorized) return

    const unsubscribe = onSnapshot(
      collectionGroup(db, 'quoteRequests'),
      snapshot => {
        const rows = snapshot.docs.map(requestDoc => {
          const data = requestDoc.data()
          const parentUser = requestDoc.ref.parent.parent

          return {
            ...data,
            id: requestDoc.id,
            ref: requestDoc.ref,
            clientUid: parentUser?.id || '',
          }
        })

        rows.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0
          const bTime = b.createdAt?.toMillis?.() || 0
          return bTime - aTime
        })

        setRequests(rows)
        setLoading(false)
      },
      err => {
        console.error('Admin quote request listener failed:', err)
        setError(
          `Firestore error (${err.code || 'unknown'}): ${err.message || 'Could not load quote requests.'}`
        )
        setLoading(false)
      }
    )

    return unsubscribe
  }, [user, authorized])

  const notificationItems = useMemo(() => requests.map(request => ({
    id: `admin-request-${request.id}-${request.status || 'updated'}`,
    title: request.status === 'Pending review' ? 'Quote request awaiting review' : 'Quote request updated',
    message: `${request.clientName || request.clientEmail || 'Client'} · ${request.service || 'Service'} — ${request.status || 'Updated'}`,
    createdAt: request.updatedAt || request.createdAt,
  })), [requests])

  const pendingCount = requests.filter(
    request => request.status === 'Pending review'
  ).length

  const selected = requests.find(request => request.id === selectedId)

  const visibleRequests = useMemo(() => {
    const term = search.trim().toLowerCase()

    return requests.filter(request => {
      const matchesStatus =
        filter === 'All requests' || request.status === filter

      const matchesSearch =
        !term ||
        [
          request.service,
          request.details,
          request.clientName,
          request.clientEmail,
          request.status,
        ].some(value => String(value || '').toLowerCase().includes(term))

      return matchesStatus && matchesSearch
    })
  }, [requests, filter, search])


  const requestPipelineData = useMemo(() => {
    const statuses = [
      { name: 'Pending review', color: '#f59e0b' },
      { name: 'Quote issued', color: '#60a5fa' },
      { name: 'Other statuses', color: '#9ca3af' },
    ]

    return statuses.map(status => ({
      ...status,
      value: requests.filter(request =>
        status.name === 'Other statuses'
          ? !['Pending review', 'Quote issued'].includes(request.status)
          : request.status === status.name
      ).length,
    }))
  }, [requests])

  const monthlyActivityData = useMemo(() => {
    const now = new Date()

    const asDate = value => {
      const date = value?.toDate
        ? value.toDate()
        : value
          ? new Date(value)
          : null

      return date && !Number.isNaN(date.getTime()) ? date : null
    }

    return Array.from({ length: 6 }, (_, index) => {
      const monthDate = new Date(
        now.getFullYear(),
        now.getMonth() - 5 + index,
        1
      )

      const year = monthDate.getFullYear()
      const month = monthDate.getMonth()

      const inMonth = value => {
        const date = asDate(value)
        return date &&
          date.getFullYear() === year &&
          date.getMonth() === month
      }

      return {
        month: monthDate.toLocaleDateString('en-GB', {
          month: 'short',
          year: '2-digit',
        }),
        requests: requests.filter(request =>
          inMonth(request.createdAt)
        ).length,
        issued: requests.filter(request =>
          inMonth(request.quoteIssuedAt)
        ).length,
      }
    })
  }, [requests])

  function selectRequest(request) {
    setSelectedId(request.id)
    setAmount('')
    setTitle(request.service || 'Service quote')
    setExpiry(defaultExpiry())
    setError('')
    setNotice('')
  }

  async function issueQuote(event) {
    event.preventDefault()
    if (!selected || issuing) return

    const numericAmount = Number(amount)

    if (!selected.clientUid) {
      setError('Could not identify the client account for this request.')
      return
    }

    if (selected.status !== 'Pending review') {
      setError('This request is no longer pending review.')
      return
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Enter a final quotation amount greater than MWK 0.')
      return
    }

    if (!title.trim()) {
      setError('Enter a title for the quotation.')
      return
    }

    if (!expiry || isPastExpiry(expiry)) {
      setError('Choose a quotation expiry date in the future.')
      return
    }

    setIssuing(true)
    setError('')
    setNotice('')

    try {
      const batch = writeBatch(db)
      const quoteRef = doc(
        collection(db, 'users', selected.clientUid, 'quotes')
      )

      const quoteNumber = `BDL-${new Date()
        .toISOString()
        .slice(0, 10)
        .replaceAll('-', '')}-${quoteRef.id.slice(0, 6).toUpperCase()}`

      batch.set(quoteRef, {
        title: title.trim(),
        service: selected.service || title.trim(),
        description: selected.details || '',
        amount: numericAmount,
        total: numericAmount,
        quoteNumber,
        clientName: selected.clientName || '',
        clientEmail: selected.clientEmail || '',
        status: 'Sent',
        validUntil: Timestamp.fromDate(
          new Date(`${expiry}T23:59:59`)
        ),
        createdAt: serverTimestamp(),
        requestId: selected.id,
      })

      batch.update(selected.ref, {
        status: 'Quote issued',
        quoteIssuedAt: serverTimestamp(),
      })

      await batch.commit()

      setNotice(
        `Quotation ${quoteNumber} issued successfully for ${money(numericAmount)}.`
      )
      setSelectedId('')
      setAmount('')
      setTitle('')
    } catch (err) {
      console.error('Issuing quote failed:', err)
      setError(
        'The quotation could not be issued. Check Firestore rules and confirm that your owner account is verified. No success was recorded.'
      )
    } finally {
      setIssuing(false)
    }
  }

  async function handleSignOut() {
    try {
      await signOut(auth)
    } finally {
      window.location.replace('/admin-login')
    }
  }

  if (!authReady) {
    return <div className="admin-loading">Checking administrator access…</div>
  }

  if (!user || !authorized) {
    return <div className="admin-loading">Redirecting…</div>
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <a href="/" className="admin-brand">
          <span className="admin-brand-icon"><ShieldCheck size={21} /></span>
          <span>
            <strong>Bless Digital Lab</strong>
            <small>ADMINISTRATION</small>
          </span>
        </a>

        <div className="admin-user">
          <span className="admin-user-avatar" aria-hidden="true">BK</span>
          <div className="admin-user-details">
            <strong>{user.displayName || 'Bless Kaundah'}</strong>
            <span className="admin-user-role">
              <ShieldCheck size={13} /> Owner &amp; Administrator
            </span>
          </div>
          <NotificationCenter key={user.uid} userKey={`admin-${user.uid}`} items={notificationItems} />
          <button className="admin-logout" onClick={handleSignOut}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </header>

      <nav className="admin-nav" aria-label="Administrator sections">
        <button
          type="button"
          className={activeSection === 'overview' ? 'is-active' : ''}
          aria-current={activeSection === 'overview' ? 'page' : undefined}
          onClick={() => setActiveSection('overview')}
        >
          <ShieldCheck size={17} /> Overview
        </button>
        <button
          type="button"
          className={activeSection === 'quotations' ? 'is-active' : ''}
          aria-current={activeSection === 'quotations' ? 'page' : undefined}
          onClick={() => setActiveSection('quotations')}
        >
          <FileText size={17} /> Quotations
        </button>
      </nav>

      <main className="admin-main">
        <div className="admin-heading">
          <div>
            <span className="admin-eyebrow">OWNER WORKSPACE</span>
            <h1>{activeSection === 'overview' ? 'Business overview' : 'Quote management'}</h1>
            <p>{activeSection === 'overview'
              ? 'Monitor quote requests and business activity.'
              : 'Review client requests and issue formal quotations.'}</p>
          </div>
          <button
            className="admin-refresh"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {activeSection === 'overview' && (
          <>
        <div className="admin-stats">
          <article>
            <span><Clock3 size={18} /> Awaiting review</span>
            <strong>{pendingCount}</strong>
            <small>Requests that need a decision</small>
          </article>
          <article>
            <span><FileText size={18} /> Total requests</span>
            <strong>{requests.length}</strong>
            <small>Across all client accounts</small>
          </article>
          <article>
            <span><CheckCircle2 size={18} /> Quotes issued</span>
            <strong>
              {requests.filter(r => r.status === 'Quote issued').length}
            </strong>
            <small>Requests with an issued quote</small>
          </article>
        </div>

        <section className="admin-analytics">
          <div className="admin-analytics-heading">
            <div>
              <span className="admin-eyebrow">BUSINESS INSIGHTS</span>
              <h2>Request analytics</h2>
              <p>Live overview based on your client quote requests.</p>
            </div>
            <span className="admin-live-indicator">
              <span /> Live data
            </span>
          </div>

          <div className="admin-chart-grid">
            <article className="admin-chart-card">
              <div className="admin-chart-title">
                <div>
                  <h3>Request pipeline</h3>
                  <p>Current request statuses</p>
                </div>
                <strong>{requests.length}</strong>
              </div>

              {loading ? (
                <div className="admin-chart-empty">Loading chart data…</div>
              ) : requests.length === 0 ? (
                <div className="admin-chart-empty">
                  No request data available yet.
                </div>
              ) : (
                <>
                  <div className="admin-donut-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={requestPipelineData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="61%"
                          outerRadius="83%"
                          paddingAngle={3}
                          stroke="none"
                        >
                          {requestPipelineData.map(entry => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [value, name]}
                          contentStyle={{
                            background: '#151923',
                            border: '1px solid #303746',
                            borderRadius: 10,
                            color: '#f3f4f6',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="admin-donut-center">
                      <strong>{requests.length}</strong>
                      <span>Requests</span>
                    </div>
                  </div>

                  <div className="admin-chart-legend">
                    {requestPipelineData.map(entry => (
                      <div key={entry.name}>
                        <span>
                          <i style={{ background: entry.color }} />
                          {entry.name}
                        </span>
                        <strong>{entry.value}</strong>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </article>

            <article className="admin-chart-card">
              <div className="admin-chart-title">
                <div>
                  <h3>Monthly request activity</h3>
                  <p>Grouped by submission month; quoted counts reflect current status</p>
                </div>
              </div>

              <div className="admin-bar-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyActivityData}
                    margin={{ top: 12, right: 4, left: -22, bottom: 2 }}
                    barGap={5}
                  >
                    <CartesianGrid
                      stroke="#29303d"
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      axisLine={{ stroke: '#343b49' }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#151923',
                        border: '1px solid #303746',
                        borderRadius: 10,
                        color: '#f3f4f6',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ color: '#cbd5e1', fontSize: 12 }}
                    />
                    <Bar
                      dataKey="requests"
                      name="Requests"
                      fill="#818cf8"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="issued"
                      name="Quote issued"
                      fill="#34d399"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="admin-chart-footnote">
                Quote-issued counts use the recorded quotation issuance date.
              </p>
            </article>
          </div>
        </section>
          </>
        )}

        {notice && (
          <div className="admin-notice" role="status">
            <CheckCircle2 size={18} /> {notice}
          </div>
        )}

        {error && (
          <div className="admin-error" role="alert">{error}</div>
        )}

        {activeSection === 'quotations' && (
        <section className="admin-workspace">
          <div className="admin-request-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>Client requests</h2>
                <p>Select a request to review its details.</p>
              </div>
            </div>

            <div className="admin-filters">
              <input
                aria-label="Search requests"
                placeholder="Search clients or services…"
                value={search}
                onChange={event => setSearch(event.target.value)}
              />
              <select
                aria-label="Filter requests by status"
                value={filter}
                onChange={event => setFilter(event.target.value)}
              >
                <option>Pending review</option>
                <option>Quote issued</option>
                <option>Accepted</option>
                <option>Declined</option>
                <option>All requests</option>
              </select>
            </div>

            {loading ? (
              <div className="admin-empty">Loading requests…</div>
            ) : visibleRequests.length === 0 ? (
              <div className="admin-empty">
                <FileText size={26} />
                <strong>No requests found</strong>
                <span>Try another filter or search term.</span>
              </div>
            ) : (
              <div className="admin-request-list">
                {visibleRequests.map(request => (
                  <button
                    key={`${request.clientUid}-${request.id}`}
                    className={`admin-request-card ${
                      selectedId === request.id ? 'is-selected' : ''
                    }`}
                    onClick={() => selectRequest(request)}
                  >
                    <span className="admin-request-card-top">
                      <strong>{request.service || 'Service request'}</strong>
                      <span className={`admin-status ${
                        request.status === 'Quote issued' ? 'is-issued' : ''
                      }`}>
                        {request.status || 'Pending'}
                      </span>
                    </span>
                    <span className="admin-client-name">
                      <UserRound size={14} />
                      {request.clientName || request.clientEmail || 'Client'}
                    </span>
                    <span className="admin-request-date">
                      {formatDate(request.createdAt)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="admin-detail-panel">
            {!selected ? (
              <div className="admin-empty admin-detail-empty">
                <FileText size={30} />
                <strong>Request details</strong>
                <span>Choose a client request from the list.</span>
              </div>
            ) : (
              <>
                <div className="admin-panel-heading">
                  <div>
                    <span className="admin-eyebrow">REQUEST DETAILS</span>
                    <h2>{selected.service || 'Service request'}</h2>
                    <p>Submitted {formatDate(selected.createdAt)}</p>
                  </div>
                  <button
                    className="admin-back"
                    onClick={() => setSelectedId('')}
                    aria-label="Close request details"
                  >
                    <ArrowLeft size={18} />
                  </button>
                </div>

                <div className="admin-detail-list">
                  <div>
                    <span>Client name</span>
                    <strong>{selected.clientName || 'Not provided'}</strong>
                  </div>
                  <div>
                    <span>Client email</span>
                    <strong>{selected.clientEmail || 'Not provided'}</strong>
                  </div>
                  <div>
                    <span>Proposed budget</span>
                    <strong>
                      {selected.budget == null
                        ? 'Not specified'
                        : money(selected.budget)}
                    </strong>
                  </div>
                  <div>
                    <span>Requested deadline</span>
                    <strong>{formatDate(selected.deadline)}</strong>
                  </div>
                  <div className="admin-detail-description">
                    <span>Project requirements</span>
                    <p>{selected.details || 'No additional details provided.'}</p>
                  </div>
                </div>

                {selected.status === 'Pending review' ? (
                  <form className="admin-quote-form" onSubmit={issueQuote}>
                    <div className="admin-form-heading">
                      <h3>Issue quotation</h3>
                      <p>The client will see this quote in their account.</p>
                    </div>

                    <label>
                      Quote title
                      <input
                        value={title}
                        onChange={event => setTitle(event.target.value)}
                        maxLength={120}
                        required
                      />
                    </label>

                    <label>
                      Final price (MWK)
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        inputMode="decimal"
                        placeholder="e.g. 150000"
                        value={amount}
                        onChange={event => setAmount(event.target.value)}
                        required
                      />
                    </label>

                    <label>
                      Quote valid until
                      <input
                        type="date"
                        min={new Date().toLocaleDateString('en-CA')}
                        value={expiry}
                        onChange={event => setExpiry(event.target.value)}
                        required
                      />
                    </label>

                    <button
                      type="submit"
                      className="admin-issue-button"
                      disabled={issuing}
                    >
                      {issuing ? 'Issuing quotation…' : 'Issue quotation'}
                    </button>

                    <small className="admin-form-note">
                      This creates a quote in the client's account and changes
                      the request status. Verify the price before issuing.
                    </small>
                  </form>
                ) : (
                  <div className="admin-issued-message">
                    <CheckCircle2 size={19} />
                    This request has been marked as Quote issued.
                  </div>
                )}
              </>
            )}
          </div>
        </section>
        )}
      </main>
    </div>
  )
}
