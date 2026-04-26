import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Dashboard from './pages/Dashboard'
import Pipeline from './pages/Pipeline'
import Followups from './pages/Followups'
import Members from './pages/Members'
import ChurnAlerts from './pages/ChurnAlerts'
import Reports from './pages/Reports'
import './App.css'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [center, setCenter] = useState('all')
  const [centers, setCenters] = useState([])
  const [stats, setStats] = useState({ leads: 0, trials: 0, conversions: 0, active: 0 })

  useEffect(() => {
    fetchCenters()
    fetchStats()
  }, [center])

  async function fetchCenters() {
    const { data } = await supabase.from('centers').select('*').order('name')
    if (data) setCenters(data)
  }

  async function fetchStats() {
    const today = new Date().toISOString().split('T')[0]

    let leadsQ = supabase.from('leads').select('id, status, created_at, center_id')
    let membersQ = supabase.from('members').select('id, status, home_center_id')

    if (center !== 'all') {
      leadsQ = leadsQ.eq('center_id', center)
      membersQ = membersQ.eq('home_center_id', center)
    }

    const { data: leads } = await leadsQ
    const { data: members } = await membersQ

    if (leads && members) {
      const todayLeads = leads.filter(l => l.created_at?.startsWith(today))
      setStats({
        leads: todayLeads.length,
        trials: leads.filter(l => l.status === 'trial_booked').length,
        conversions: leads.filter(l => l.status === 'converted').length,
        active: members.filter(m => m.status === 'active').length
      })
    }
  }

  const pages = { dashboard: Dashboard, pipeline: Pipeline, followups: Followups, members: Members, churn: ChurnAlerts, reports: Reports }
  const PageComponent = pages[page] || Dashboard

  return (
    <div className="app">
      <div className="topbar">
        <div className="logo">CROSSTRAIN <span>FC</span></div>
        <div className="center-tabs">
          <button className={`ctab ${center === 'all' ? 'active' : ''}`} onClick={() => setCenter('all')}>All Centers</button>
          {centers.map(c => (
            <button key={c.id} className={`ctab ${center === c.id ? 'active' : ''}`} onClick={() => setCenter(c.id)}>
              {c.city}
            </button>
          ))}
        </div>
        <div className="topright">
          <span className="badge-dot"></span>
          <span>Live Dashboard</span>
        </div>
      </div>

      <div className="layout">
        <div className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">Operations</div>
            <div className={`nav-item ${page === 'dashboard' ? 'active' : ''}`} onClick={() => setPage('dashboard')}>◈ Dashboard</div>
            <div className={`nav-item ${page === 'pipeline' ? 'active' : ''}`} onClick={() => setPage('pipeline')}>◫ Lead Pipeline</div>
            <div className={`nav-item ${page === 'followups' ? 'active' : ''}`} onClick={() => setPage('followups')}>◷ Follow-ups</div>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-label">Members</div>
            <div className={`nav-item ${page === 'members' ? 'active' : ''}`} onClick={() => setPage('members')}>◉ All Members</div>
            <div className={`nav-item ${page === 'churn' ? 'active' : ''}`} onClick={() => setPage('churn')}>◌ Churn Alerts</div>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-label">Reports</div>
            <div className={`nav-item ${page === 'reports' ? 'active' : ''}`} onClick={() => setPage('reports')}>◎ Analytics</div>
          </div>
        </div>
        <div className="main">
          <PageComponent center={center} stats={stats} />
        </div>
      </div>
    </div>
  )
}
