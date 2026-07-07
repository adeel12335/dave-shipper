'use client'
import Image from 'next/image'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ADMIN_FILTER_DEFS, PAGE_TO_TABLE } from '@/lib/admin/filter-definitions'
import type { AdminFilterDef } from '@/lib/admin/filter-definitions'

const STATUS_LABELS: Record<string, string> = { new: 'New', contacted: 'Contacted', form_sent: 'Form Sent', matched: 'Matched', invoiced: 'Invoiced', closed: 'Closed' }
const STATUS_COLORS: Record<string, string> = { new: '#3b82f6', contacted: '#f59e0b', form_sent: '#8b5cf6', matched: '#22c55e', invoiced: '#d4a03c', closed: '#6b7a8d' }
const POSITION_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'class1_ld', label: 'Classe 1 — Longue distance' },
  { value: 'class1_local', label: 'Classe 1 — Local/Regional' },
  { value: 'class3', label: 'Classe 3' },
  { value: 'shunter', label: 'Shunteur' },
  { value: 'delivery', label: 'Livreur' },
  { value: 'driver_handler', label: 'Manutentionnaire-chauffeur' },
  { value: 'other', label: 'Autre' },
]

type PageType = 'dashboard' | 'leads' | 'drivers' | 'companies' | 'settings'

export default function AdminPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [page, setPage] = useState<PageType>('dashboard')
  const [stats, setStats] = useState({ leads: 0, drivers: 0, companies: 0, newCount: 0 })
  const [tableData, setTableData] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [fieldFilters, setFieldFilters] = useState<Record<string, string>>({})
  const [showFilters, setShowFilters] = useState(false)
  const [copyMsg, setCopyMsg] = useState('')
  const [syncMsg, setSyncMsg] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [selectedRow, setSelectedRow] = useState<any>(null)

  const [cfg, setCfg] = useState<Record<string, string>>({})
  const [cfgSaving, setCfgSaving] = useState<string | null>(null)
  const [cfgMsg, setCfgMsg] = useState<Record<string, string>>({})
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setLoading(false)
    })
  }, [])

  useEffect(() => { if (user) loadStats() }, [user])

  useEffect(() => {
    if (!user) return
    if (['leads', 'drivers', 'companies'].includes(page)) loadTable()
    if (page === 'settings') loadCfg()
  }, [user, page, currentPage, statusFilter, fieldFilters])

  const tableName = PAGE_TO_TABLE[page] || 'company_leads'
  const filterDefs = useMemo(() => {
    const defs = ADMIN_FILTER_DEFS[tableName] || []
    return defs.filter((d) => d.key !== 'status')
  }, [tableName])

  const hasActiveFilters = Object.values(fieldFilters).some((v) => v?.trim())

  const resetFilters = () => { setFieldFilters({}); setCurrentPage(1) }

  const setFilter = (key: string, value: string) => {
    setFieldFilters((f) => {
      const next = { ...f }
      if (!value?.trim()) delete next[key]
      else next[key] = value
      return next
    })
    setCurrentPage(1)
  }

  const loadStats = async () => {
    const r = await fetch('/api/admin/stats')
    if (r.ok) setStats(await r.json())
  }

  const loadTable = useCallback(async () => {
    const table = PAGE_TO_TABLE[page] || 'company_leads'
    const p = new URLSearchParams({ table, page: String(currentPage), limit: '20' })
    if (statusFilter) p.set('status', statusFilter)
    const active = Object.fromEntries(Object.entries(fieldFilters).filter(([, v]) => v?.trim()))
    if (Object.keys(active).length) p.set('filters', JSON.stringify(active))
    const r = await fetch(`/api/admin/data?${p}`)
    if (r.ok) { const { data, count } = await r.json(); setTableData(data || []); setTotalCount(count || 0) }
  }, [page, currentPage, statusFilter, fieldFilters])

  const loadCfg = async () => {
    const r = await fetch('/api/admin/settings')
    if (r.ok) setCfg(await r.json())
  }

  const saveCfg = async (section: string, keys: string[]) => {
    setCfgSaving(section)
    const payload: Record<string, string> = {}
    keys.forEach(k => { payload[k] = cfg[k] ?? '' })
    const r = await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setCfgSaving(null)
    setCfgMsg(m => ({ ...m, [section]: r.ok ? 'Saved!' : 'Error saving.' }))
    setTimeout(() => setCfgMsg(m => ({ ...m, [section]: '' })), 3000)
  }

  const setCfgKey = (k: string, v: string) => setCfg(s => ({ ...s, [k]: v }))

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoginErr(''); setLoginLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPass })
    if (error) { setLoginErr(error.message); setLoginLoading(false); return }
    const { data: { user: u } } = await supabase.auth.getUser()
    setUser(u); setLoginLoading(false)
  }

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null) }

  const updateStatus = async (table: string, id: string, status: string) => {
    await fetch('/api/admin/data', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table, id, updates: { status } }) })
    loadTable(); loadStats()
    if (selectedRow?.id === id) setSelectedRow((r: any) => ({ ...r, status }))
  }

  const copyFormLink = async (leadId: string) => {
    const url = `${window.location.origin}/forms/company-form?lead=${leadId}&lang=fr`
    try {
      await navigator.clipboard.writeText(url)
      setCopyMsg('Link copied!')
    } catch {
      setCopyMsg('Copy failed')
    }
    setTimeout(() => setCopyMsg(''), 2500)
  }

  const syncToZoho = async () => {
    if (!selectedRow?.id) return
    const table = PAGE_TO_TABLE[page]
    setSyncing(true)
    setSyncMsg('')
    try {
      const r = await fetch('/api/admin/sync-zoho', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, id: selectedRow.id }),
      })
      const data = await r.json()
      if (!r.ok) {
        setSyncMsg(data.error || 'Sync failed')
      } else if (data.synced) {
        setSyncMsg('Synced to Zoho!')
        setSelectedRow((row: any) => ({ ...row, synced_zoho: true }))
        loadTable()
      } else {
        setSyncMsg('Zoho sync is disabled or not configured')
      }
    } catch {
      setSyncMsg('Sync failed')
    }
    setSyncing(false)
    setTimeout(() => setSyncMsg(''), 4000)
  }

  const exportCsv = async () => {
    setExporting(true)
    try {
      const table = PAGE_TO_TABLE[page] || 'company_leads'
      const p = new URLSearchParams({ table })
      if (statusFilter) p.set('status', statusFilter)
      const active = Object.fromEntries(Object.entries(fieldFilters).filter(([, v]) => v?.trim()))
      if (Object.keys(active).length) p.set('filters', JSON.stringify(active))
      const r = await fetch(`/api/admin/export?${p}`)
      if (!r.ok) throw new Error('Export failed')
      const blob = await r.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${table}-export.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Export failed')
    }
    setExporting(false)
  }

  const TABLE_MAP: Record<string, string> = { leads: 'company_leads', drivers: 'driver_applications', companies: 'company_applications' }

  if (loading) return <div style={{ minHeight: '100vh', background: '#0a1420', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading...</div>

  if (!user) return (
    <div className="login-page">
      <div className="login-card">
        <Image src="/images/logo-icon.png" alt="TruckRecruit" width={56} height={56} style={{ margin: '0 auto 12px', display: 'block' }} />
        <h1>Admin Panel</h1>
        <p className="subtitle">Sign in with your admin credentials</p>
        <form onSubmit={handleLogin}>
          <div className="login-field"><label>Email</label><input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="admin@truckrecruit.com" required /></div>
          <div className="login-field"><label>Password</label><input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Enter password" required /></div>
          <button type="submit" className="login-btn" disabled={loginLoading}>{loginLoading ? 'Signing in...' : 'Sign In'}</button>
          {loginErr && <div className="login-error show">{loginErr}</div>}
        </form>
      </div>
    </div>
  )

  return (
    <div className="admin-app active">
      {/* mobile sidebar overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 299 }} />
      )}
      {/* SIDEBAR */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-header">
          <Image src="/images/logo-icon.png" alt="TruckRecruit" width={40} height={40} />
          <span>ADMIN</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Overview</div>
            <button className={`nav-item${page === 'dashboard' ? ' active' : ''}`} onClick={() => setPage('dashboard')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              Dashboard
            </button>
          </div>
          <div className="nav-section">
            <div className="nav-section-title">Data</div>
            {([['leads','Company Leads',stats.leads],['drivers','Driver Applications',stats.drivers],['companies','Company Applications',stats.companies]] as [PageType,string,number][]).map(([id,label,badge]) => (
              <button key={id} className={`nav-item${page === id ? ' active' : ''}`} onClick={() => { setPage(id); setCurrentPage(1); setStatusFilter(''); setFieldFilters({}); setShowFilters(false) }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="4"/><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/></svg>
                {label}
                <span className="nav-badge">{badge}</span>
              </button>
            ))}
          </div>
          <div className="nav-section">
            <div className="nav-section-title">Configuration</div>
            <button className={`nav-item${page === 'settings' ? ' active' : ''}`} onClick={() => setPage('settings')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Settings
            </button>
          </div>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{user.email?.charAt(0).toUpperCase()}</div>
            <span style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main-content" style={{ marginLeft: 260, flex: 1, minHeight: '100vh', background: 'var(--bg)' }}>
        <div className="topbar-admin">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="menu-toggle" onClick={() => setSidebarOpen(v => !v)}
              style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: '#14222f' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <h2 className="topbar-title" style={{ textTransform: 'capitalize' }}>{page}</h2>
          </div>
        </div>

        <div className="content-area">

          {/* DASHBOARD */}
          {page === 'dashboard' && (
            <div className="page-view active">
              <div className="stats-grid">
                {[['Company Leads',stats.leads],['Driver Applications',stats.drivers],['Company Applications',stats.companies],['New (Unprocessed)',stats.newCount]].map(([label,value]) => (
                  <div key={label as string} className="stat-card">
                    <div className="stat-card-value" style={{ fontSize: 32, fontWeight: 900, color: 'var(--text)' }}>{value}</div>
                    <div className="stat-card-label">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DATA TABLES */}
          {['leads','drivers','companies'].includes(page) && (
            <div className="page-view active">
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                {['','new','contacted','form_sent','matched','invoiced','closed'].map(s => (
                  <button key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1) }}
                    style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid var(--border)', background: statusFilter===s?'var(--gold)':'white', color: statusFilter===s?'var(--navy-800)':'var(--text)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    {s ? STATUS_LABELS[s] : 'All'}
                  </button>
                ))}
                <button
                  className={`filters-toggle${showFilters || hasActiveFilters ? ' active' : ''}`}
                  onClick={() => setShowFilters(v => !v)}
                  style={{ marginLeft: 'auto' }}
                >
                  {hasActiveFilters && <span className="dot" />}
                  Filters
                </button>
                <button
                  onClick={exportCsv}
                  disabled={exporting}
                  style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                >
                  {exporting ? 'Exporting...' : 'Export CSV'}
                </button>
              </div>

              {showFilters && (
                <div className="filters-panel">
                  <div className="filters-panel-header">
                    <h4>Filter by field</h4>
                    <span className="filters-count">{filterDefs.length} fields available</span>
                  </div>
                  <div className="filters-grid filters-grid-wide">
                    {filterDefs.map((def) => (
                      <FilterInput key={def.key} def={def} table={tableName} value={fieldFilters[def.key] || ''} onChange={(v) => setFilter(def.key, v)} />
                    ))}
                  </div>
                  {hasActiveFilters && (
                    <div className="filters-actions">
                      <button className="filters-clear" onClick={resetFilters}>Clear all filters</button>
                    </div>
                  )}
                </div>
              )}
              <div className="table-card">
                <div className="table-wrap">
                  <table>
                    <thead><tr>
                      <th>Name</th>{page!=='drivers'&&<th>Company</th>}<th>Contact</th><th>Status</th><th>Date</th><th></th>
                    </tr></thead>
                    <tbody>
                      {tableData.length===0
                        ? <tr><td colSpan={6} className="table-empty">No records found</td></tr>
                        : tableData.map(row => (
                          <tr key={row.id} style={{ cursor:'pointer' }} onClick={() => setSelectedRow(row)}>
                            <td><strong>{row.full_name||row.company_name||'-'}</strong></td>
                            {page!=='drivers'&&<td>{row.company_name||'-'}</td>}
                            <td>
                              <div>{row.email||row.contact_name||'-'}</div>
                              <div style={{ fontSize:12,color:'var(--muted)' }}>{row.phone||''}</div>
                            </td>
                            <td>
                              <select value={row.status} onClick={e=>e.stopPropagation()} onChange={e=>updateStatus(TABLE_MAP[page],row.id,e.target.value)}
                                style={{ padding:'4px 8px',borderRadius:6,border:'1px solid var(--border)',fontSize:12,fontWeight:700,color:STATUS_COLORS[row.status]||'#666',background:'white' }}>
                                {Object.entries(STATUS_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                              </select>
                            </td>
                            <td style={{ fontSize:12,color:'var(--muted)' }}>{new Date(row.created_at).toLocaleDateString()}</td>
                            <td><button onClick={e=>{e.stopPropagation();setSelectedRow(row)}} style={{ padding:'5px 12px',borderRadius:6,border:'1px solid var(--border)',background:'white',fontSize:12,cursor:'pointer',fontWeight:600 }}>View</button></td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderTop:'1px solid var(--border)',fontSize:13 }}>
                  <span style={{ color:'var(--muted)' }}>{totalCount} total</span>
                  <div style={{ display:'flex',gap:8 }}>
                    <button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} style={{ padding:'6px 14px',borderRadius:6,border:'1px solid var(--border)',background:'white',cursor:'pointer',fontWeight:600,opacity:currentPage===1?.4:1 }}>Prev</button>
                    <span style={{ padding:'6px 14px',fontWeight:700 }}>Page {currentPage}</span>
                    <button onClick={()=>setCurrentPage(p=>p+1)} disabled={currentPage*20>=totalCount} style={{ padding:'6px 14px',borderRadius:6,border:'1px solid var(--border)',background:'white',cursor:'pointer',fontWeight:600,opacity:currentPage*20>=totalCount?.4:1 }}>Next</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {page==='settings' && (
            <div className="page-view active">
              <div style={{ maxWidth:720 }}>

                <CfgCard title="Email / SMTP" section="smtp" saving={cfgSaving} msg={cfgMsg}
                  onSave={()=>saveCfg('smtp',['smtp_enabled','smtp_host','smtp_port','smtp_user','smtp_pass','smtp_from_email','smtp_from_name'])}>
                  <CfgToggle label="Enable email notifications" k="smtp_enabled" cfg={cfg} set={setCfgKey}/>
                  <CfgRow label="SMTP Host" k="smtp_host" cfg={cfg} set={setCfgKey} placeholder="smtp.gmail.com"/>
                  <CfgRow label="SMTP Port" k="smtp_port" cfg={cfg} set={setCfgKey} placeholder="587"/>
                  <CfgRow label="Username" k="smtp_user" cfg={cfg} set={setCfgKey} placeholder="you@gmail.com"/>
                  <CfgRow label="Password / App Key" k="smtp_pass" cfg={cfg} set={setCfgKey} type="password"/>
                  <CfgRow label="From Email" k="smtp_from_email" cfg={cfg} set={setCfgKey} placeholder="no-reply@truckrecruit.com"/>
                  <CfgRow label="From Name" k="smtp_from_name" cfg={cfg} set={setCfgKey} placeholder="TruckRecruit"/>
                </CfgCard>

                <CfgCard title="Zoho Recruit" section="zoho" saving={cfgSaving} msg={cfgMsg}
                  onSave={()=>saveCfg('zoho',['zoho_enabled','zoho_client_id','zoho_client_secret','zoho_refresh_token','zoho_account_url'])}>
                  <CfgToggle label="Enable Zoho Recruit sync" k="zoho_enabled" cfg={cfg} set={setCfgKey}/>
                  <p style={{ fontSize:12,color:'#6b7a8d',marginBottom:14,lineHeight:1.6 }}>
                    Zoho API Console &rarr; Self Client &rarr; Generate Refresh Token<br/>
                    Scopes: <code>ZohoRecruit.modules.Candidates.CREATE</code>, <code>ZohoRecruit.modules.client.CREATE</code>
                  </p>
                  <CfgRow label="Client ID" k="zoho_client_id" cfg={cfg} set={setCfgKey} placeholder="1000.XXXX"/>
                  <CfgRow label="Client Secret" k="zoho_client_secret" cfg={cfg} set={setCfgKey} type="password"/>
                  <CfgRow label="Refresh Token" k="zoho_refresh_token" cfg={cfg} set={setCfgKey} type="password"/>
                  <CfgRow label="Account URL" k="zoho_account_url" cfg={cfg} set={setCfgKey} placeholder="accounts.zoho.com"/>
                </CfgCard>

                <CfgCard title="OneDrive / Excel" section="onedrive" saving={cfgSaving} msg={cfgMsg}
                  onSave={()=>saveCfg('onedrive',['onedrive_enabled','onedrive_tenant_id','onedrive_client_id','onedrive_client_secret','onedrive_drive_id','onedrive_file_id','onedrive_sheet_name'])}>
                  <CfgToggle label="Enable OneDrive Excel sync" k="onedrive_enabled" cfg={cfg} set={setCfgKey}/>
                  <p style={{ fontSize:12,color:'#6b7a8d',marginBottom:14,lineHeight:1.6 }}>
                    Azure Portal &rarr; App registrations &rarr; Files.ReadWrite.All (Application permission)
                  </p>
                  <CfgRow label="Tenant ID" k="onedrive_tenant_id" cfg={cfg} set={setCfgKey} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"/>
                  <CfgRow label="Client ID" k="onedrive_client_id" cfg={cfg} set={setCfgKey} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"/>
                  <CfgRow label="Client Secret" k="onedrive_client_secret" cfg={cfg} set={setCfgKey} type="password"/>
                  <CfgRow label="Drive ID" k="onedrive_drive_id" cfg={cfg} set={setCfgKey} placeholder="b!xxxx..."/>
                  <CfgRow label="File ID (Excel)" k="onedrive_file_id" cfg={cfg} set={setCfgKey} placeholder="01XXXX..."/>
                  <CfgRow label="Sheet Name" k="onedrive_sheet_name" cfg={cfg} set={setCfgKey} placeholder="Sheet1"/>
                </CfgCard>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedRow && (
        <div className="modal-overlay open" onClick={() => setSelectedRow(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedRow.full_name || selectedRow.company_name || 'Detail'}</h3>
              <button className="modal-close" onClick={() => setSelectedRow(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {page === 'leads' && selectedRow.id && (
                  <button className="modal-btn modal-btn-primary" onClick={() => copyFormLink(selectedRow.id)}>
                    Copy detailed form link
                  </button>
                )}
                {['leads', 'drivers', 'companies'].includes(page) && selectedRow.id && (
                  <button
                    className="modal-btn"
                    onClick={syncToZoho}
                    disabled={syncing || selectedRow.synced_zoho}
                    style={{ opacity: selectedRow.synced_zoho ? 0.6 : 1 }}
                  >
                    {selectedRow.synced_zoho ? 'Already synced to Zoho' : syncing ? 'Syncing...' : 'Sync to Zoho'}
                  </button>
                )}
                {copyMsg && <span style={{ fontSize: 13, fontWeight: 600, color: copyMsg === 'Link copied!' ? 'var(--green)' : 'var(--red)' }}>{copyMsg}</span>}
                {syncMsg && <span style={{ fontSize: 13, fontWeight: 600, color: syncMsg.includes('Synced') ? 'var(--green)' : 'var(--red)' }}>{syncMsg}</span>}
              </div>
              <div className="modal-grid">
                {Object.entries(selectedRow)
                  .filter(([k]) => k !== 'id' && !(page === 'companies' && k === 'details'))
                  .map(([k, v]) => (
                    <div key={k} className={`modal-field${k === 'admin_notes' || k === 'message' ? ' full' : ''}`}>
                      <label>{k.replace(/_/g, ' ')}</label>
                      <div className={`value${!v || (Array.isArray(v) && !v.length) ? ' empty' : ''}`}>
                        {formatFieldValue(k, v)}
                      </div>
                    </div>
                  ))}
              </div>
              {page === 'companies' && selectedRow.details && typeof selectedRow.details === 'object' && Object.keys(selectedRow.details).length > 0 && (
                <div className="modal-field full" style={{ marginTop: 20 }}>
                  <label>Form Details</label>
                  <DetailsBlock data={selectedRow.details} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterInput({ def, table, value, onChange }: { def: AdminFilterDef; table: string; value: string; onChange: (v: string) => void }) {
  const [dynamicOpts, setDynamicOpts] = useState<{ value: string; label: string }[]>([])
  const [loadingOpts, setLoadingOpts] = useState(false)

  useEffect(() => {
    if (!def.dynamic) return
    setLoadingOpts(true)
    const p = new URLSearchParams({ table, field: def.key, jsonb: String(!!def.jsonb) })
    fetch(`/api/admin/filter-options?${p}`)
      .then((r) => r.json())
      .then((d) => setDynamicOpts(d.options || []))
      .catch(() => setDynamicOpts([]))
      .finally(() => setLoadingOpts(false))
  }, [def.key, def.dynamic, def.jsonb, table])

  const isCreatedRange = def.key === 'created_from' || def.key === 'created_to'
  if (isCreatedRange) {
    return (
      <div className="filter-field">
        <label>{def.label}</label>
        <input type="date" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    )
  }

  const options = def.dynamic ? dynamicOpts : (def.options || [])

  return (
    <div className="filter-field">
      <label>{def.label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={loadingOpts && def.dynamic}>
        <option value="">{loadingOpts && def.dynamic ? 'Loading...' : 'All'}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function formatFieldValue(key: string, value: unknown): React.ReactNode {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) {
    if (!value.length) return '—'
    return <span className="tags">{value.map((item, i) => <span key={i} className="tag">{String(item)}</span>)}</span>
  }
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  if (key === 'created_at' || key.endsWith('_at')) {
    try { return new Date(String(value)).toLocaleString() } catch { return String(value) }
  }
  if (key === 'position_type') {
    const match = POSITION_TYPE_OPTIONS.find(o => o.value === value)
    return match ? match.label : String(value)
  }
  return String(value)
}

function formatDetailKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function DetailsBlock({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([, v]) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && !v.length))
  if (!entries.length) return <div className="value empty">No additional details</div>
  return (
    <div className="details-block">
      {entries.map(([key, value]) => (
        <div key={key} className="detail-row">
          <div className="detail-key">{formatDetailKey(key)}</div>
          <div className="detail-val">{formatFieldValue(key, value)}</div>
        </div>
      ))}
    </div>
  )
}

function CfgCard({ title, section, saving, msg, onSave, children }: {
  title: string; section: string; saving: string|null; msg: Record<string,string>; onSave: ()=>void; children: React.ReactNode
}) {
  return (
    <div style={{ background:'white',borderRadius:14,border:'1px solid #e8edf5',boxShadow:'0 2px 10px rgba(0,0,0,.05)',marginBottom:24,overflow:'hidden' }}>
      <div style={{ padding:'18px 24px',borderBottom:'1px solid #f0f2f6' }}>
        <h3 style={{ fontSize:15,fontWeight:800,color:'#14222f',margin:0 }}>{title}</h3>
      </div>
      <div style={{ padding:'20px 24px' }}>
        {children}
        <div style={{ display:'flex',alignItems:'center',gap:12,marginTop:20,paddingTop:16,borderTop:'1px solid #f0f2f6' }}>
          <button onClick={onSave} disabled={saving===section}
            style={{ padding:'10px 24px',background:'linear-gradient(135deg,#d4a03c,#b8872e)',color:'#0a1420',fontWeight:800,fontSize:14,borderRadius:8,border:'none',cursor:'pointer' }}>
            {saving===section?'Saving...':'Save'}
          </button>
          {msg[section]&&<span style={{ fontSize:13,fontWeight:600,color:msg[section]==='Saved!'?'#22c55e':'#ef4444' }}>{msg[section]}</span>}
        </div>
      </div>
    </div>
  )
}

function CfgRow({ label, k, cfg, set, placeholder, type='text' }: {
  label: string; k: string; cfg: Record<string,string>; set: (k:string,v:string)=>void; placeholder?: string; type?: string
}) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block',fontSize:12,fontWeight:700,color:'#14222f',marginBottom:5 }}>{label}</label>
      <input type={type} value={cfg[k]??''} onChange={e=>set(k,e.target.value)} placeholder={placeholder}
        style={{ width:'100%',padding:'9px 12px',borderRadius:8,border:'1.5px solid #e0e7ef',fontSize:13,outline:'none',boxSizing:'border-box' }}/>
    </div>
  )
}

function CfgToggle({ label, k, cfg, set }: {
  label: string; k: string; cfg: Record<string,string>; set: (k:string,v:string)=>void
}) {
  const on = cfg[k]==='true'
  return (
    <label style={{ display:'flex',alignItems:'center',gap:10,cursor:'pointer',marginBottom:16,padding:'10px 14px',background:on?'#f0fdf4':'#f8f9fc',borderRadius:8,border:`1.5px solid ${on?'#86efac':'#e0e7ef'}` }}>
      <div onClick={()=>set(k,on?'false':'true')}
        style={{ width:40,height:22,borderRadius:11,background:on?'#22c55e':'#cbd5e1',position:'relative',transition:'background .2s',cursor:'pointer',flexShrink:0 }}>
        <div style={{ position:'absolute',top:3,left:on?21:3,width:16,height:16,borderRadius:'50%',background:'white',transition:'left .2s',boxShadow:'0 1px 3px rgba(0,0,0,.2)' }}/>
      </div>
      <span style={{ fontSize:13,fontWeight:700,color:'#14222f' }}>{label}</span>
      <span style={{ fontSize:11,fontWeight:600,color:on?'#16a34a':'#94a3b8',marginLeft:'auto' }}>{on?'ENABLED':'DISABLED'}</span>
    </label>
  )
}
