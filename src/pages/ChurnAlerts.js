import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ChurnAlerts({ center }) {
  const [atRisk, setAtRisk] = useState([])
  const [renewals, setRenewals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [center])

  async function fetchData() {
    setLoading(true)
    let q = supabase.from('members').select('*, centers(name, city)')
    if (center !== 'all') q = q.eq('home_center_id', center)
    const { data: members } = await q

    if (members) {
      const now = new Date()
      const risk = members.filter(m => {
        const daysSinceExpiry = (now - new Date(m.expiry_date)) / (1000*60*60*24)
        return m.status === 'inactive' || daysSinceExpiry > 0
      })
      const soon = members.filter(m => {
        const daysLeft = (new Date(m.expiry_date) - now) / (1000*60*60*24)
        return daysLeft >= 0 && daysLeft <= 10 && m.status === 'active'
      })
      setAtRisk(risk)
      setRenewals(soon)
    }
    setLoading(false)
  }

  const getInitials = name => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || '??'

  if (loading) return <div className="loading">Loading churn data...</div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">CHURN ALERTS</div>
        <div className="page-sub">{atRisk.length + renewals.length} MEMBERS NEED ATTENTION</div>
      </div>

      <div className="metrics-row" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        <div className="metric-card red">
          <div className="metric-label">Inactive / Expired</div>
          <div className="metric-val" style={{color:'var(--red)'}}>{atRisk.length}</div>
          <div className="metric-change down">Needs action</div>
        </div>
        <div className="metric-card gold">
          <div className="metric-label">Renewing This Week</div>
          <div className="metric-val">{renewals.length}</div>
          <div className="metric-change">Revenue at risk</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total At Risk</div>
          <div className="metric-val">{atRisk.length + renewals.length}</div>
          <div className="metric-change down">Call them today</div>
        </div>
      </div>

      {renewals.length > 0 && (
        <div className="card">
          <div className="card-header"><div className="card-title">Renewing Soon (Within 10 Days)</div></div>
          {renewals.map(m => {
            const daysLeft = Math.round((new Date(m.expiry_date) - new Date()) / (1000*60*60*24))
            return (
              <div key={m.id} className="row">
                <div className="status-dot dot-red" style={{background:'var(--gold)'}}></div>
                <div className="avatar">{getInitials(m.name)}</div>
                <div className="info">
                  <div className="name">{m.name}</div>
                  <div className="sub">{m.centers?.city} · {m.plan} · ₹{m.plan_price?.toLocaleString('en-IN')}</div>
                </div>
                <div style={{fontSize:11,color:'var(--gold-light)',marginRight:8}}>{daysLeft}d left</div>
                <button className="btn btn-ghost">Remind</button>
              </div>
            )
          })}
        </div>
      )}

      {atRisk.length > 0 && (
        <div className="card">
          <div className="card-header"><div className="card-title">Inactive / Expired Members</div></div>
          {atRisk.map(m => (
            <div key={m.id} className="row">
              <div className="status-dot dot-red"></div>
              <div className="avatar">{getInitials(m.name)}</div>
              <div className="info">
                <div className="name">{m.name}</div>
                <div className="sub">{m.centers?.city} · Last plan: {m.plan} · {m.phone}</div>
              </div>
              <div className="churn-pill">At Risk</div>
              <button className="btn btn-ghost" style={{marginLeft:8}}>Call Now</button>
            </div>
          ))}
        </div>
      )}

      {atRisk.length === 0 && renewals.length === 0 && (
        <div style={{textAlign:'center',padding:60}}>
          <div style={{fontSize:48,marginBottom:12}}>🏆</div>
          <div style={{color:'var(--text-muted)'}}>No churn risks right now. Great retention!</div>
        </div>
      )}
    </div>
  )
}
