from pathlib import Path
from datetime import datetime
import sys

p = Path("src/pages/ClientDashboard.jsx")
s = p.read_text()
original = s

old_loading = """    const unsubscribers = paths.map(([name, setter]) =>
      onSnapshot(
        collection(db, 'users', user.uid, name),
        snapshot => {
          setter(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
          setLoading(false)
        },
        err => {
          console.error(`Firestore ${name} error:`, err)
          setError(
            'Some portal data could not be loaded. Check that Firestore is enabled and its security rules are published.'
          )
          setLoading(false)
        }
      )
    )"""

new_loading = """    const loadedCollections = new Set()
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
    )"""

if s.count(old_loading) != 1:
    sys.exit("STOP: loading block did not match exactly; no changes made.")

s = s.replace(old_loading, new_loading, 1)

# Add no-match messages before the filtered record lists.
patches = [
('''              : <div className="client-card-list">
                {filteredProjects.slice(0, 3).map(project =>''',
 '''              : filteredProjects.length === 0 && query
                ? <Empty title="No matching projects" description="Try a different search term to find your projects." />
                : <div className="client-card-list">
                {filteredProjects.slice(0, 3).map(project =>'''),
('''              : <InvoiceTable invoices={filteredInvoices.slice(0, 3)} />}''',
 '''              : filteredInvoices.length === 0 && query
                ? <Empty title="No matching invoices" description="Try a different search term to find your invoices." />
                : <InvoiceTable invoices={filteredInvoices.slice(0, 3)} />}'''),
('''              : <div className="client-project-grid">{filteredProjects.map(project =>''',
 '''              : filteredProjects.length === 0 && query
                ? <Empty title="No matching projects" description="Try a different search term to find your projects." />
                : <div className="client-project-grid">{filteredProjects.map(project =>'''),
('''              : <div className="client-table-wrap"><table className="client-table">
                <thead><tr><th>Quote</th>''',
 '''              : filteredQuotes.length === 0 && query
                ? <Empty title="No matching quotes" description="Try a different search term to find your quotes." />
                : <div className="client-table-wrap"><table className="client-table">
                <thead><tr><th>Quote</th>'''),
('''              : <div className="client-table-wrap"><table className="client-table">
                <thead><tr><th>Service</th>''',
 '''              : filteredRequests.length === 0 && query
                ? <Empty title="No matching requests" description="Try a different search term to find your requests." />
                : <div className="client-table-wrap"><table className="client-table">
                <thead><tr><th>Service</th>'''),
('''              : <InvoiceTable invoices={filteredInvoices} />}''',
 '''              : filteredInvoices.length === 0 && query
                ? <Empty title="No matching invoices" description="Try a different search term to find your invoices." />
                : <InvoiceTable invoices={filteredInvoices} />}''')
]

for old, new in patches:
    if s.count(old) != 1:
        sys.exit("STOP: a JSX section did not match exactly; no changes made.")
    s = s.replace(old, new, 1)

backup = Path(f"{p}.backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}")
backup.write_text(original)
p.write_text(s)
print("SUCCESS: Dashboard improvements applied.")
print(f"Backup: {backup}")
