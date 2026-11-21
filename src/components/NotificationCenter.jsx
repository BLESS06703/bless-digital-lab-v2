import { useEffect, useMemo, useState } from 'react'
import { Bell, CheckCheck, Clock3 } from 'lucide-react'
import './NotificationCenter.css'

function timeValue(item) {
  const value = item.createdAt
  if (value?.toMillis) return value.toMillis()
  if (value?.toDate) return value.toDate().getTime()
  const parsed = new Date(value || 0).getTime()
  return Number.isFinite(parsed) ? parsed : 0
}

function timeLabel(item) {
  const time = timeValue(item)
  return time
    ? new Date(time).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Recently'
}

export default function NotificationCenter({ userKey, items = [] }) {
  const storageKey = `bdl-notifications-read-${userKey}`
  const [open, setOpen] = useState(false)
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(readIds.slice(-300)))
    } catch {
      // Continue working when browser storage is unavailable.
    }
  }, [storageKey, readIds])

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => timeValue(b) - timeValue(a)).slice(0, 30),
    [items],
  )
  const unreadCount = sortedItems.filter(item => !readIds.includes(item.id)).length

  const markRead = id => setReadIds(old => [...new Set([...old, id])].slice(-300))
  const markAllRead = () => setReadIds(old =>
    [...new Set([...old, ...sortedItems.map(item => item.id)])].slice(-300),
  )

  return (
    <div className="bdl-notification-center">
      <button
        className="bdl-notification-bell"
        type="button"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="bdl-notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            className="bdl-notification-backdrop"
            type="button"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <section className="bdl-notification-panel" aria-label="Notifications">
            <header className="bdl-notification-heading">
              <div>
                <strong>Notifications</strong>
                <small>{unreadCount} unread</small>
              </div>
              <button type="button" onClick={markAllRead} disabled={!unreadCount}>
                <CheckCheck size={15} /> Mark all read
              </button>
            </header>
            <div className="bdl-notification-list">
              {sortedItems.length === 0 ? (
                <p className="bdl-notification-empty">
                  No updates yet. New updates will appear here.
                </p>
              ) : sortedItems.map(item => (
                <button
                  type="button"
                  key={item.id}
                  className={`bdl-notification-item${readIds.includes(item.id) ? ' is-read' : ' is-unread'}`}
                  onClick={() => markRead(item.id)}
                >
                  <span className="bdl-notification-dot" />
                  <span className="bdl-notification-copy">
                    <strong>{item.title}</strong>
                    <span>{item.message}</span>
                    <small><Clock3 size={12} /> {timeLabel(item)}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
