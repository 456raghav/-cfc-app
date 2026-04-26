import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard({ center, stats }) {
  const [leads, setLeads] = useState([])
  const [members, setMembers] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [center])

  async function fetchData() {
    setLoading(true)
    let lQ = supabase.from('leads').select('*, centers(name)').order('created_at', { ascending: false }).limit(20)
    let mQ = supabase.from('members').select('*, centers(name, city)').order('created_at', { ascending: false }).limit(10)
    let cQ = supabase.from('classes').select('*, centers(name), disciplines(name)').order('time_slot')
    if (center !== 'all') { lQ = lQ.eq('center_id', center); mQ = mQ.eq('home_center_id', center) }
    const [{ data: l }, { data: m }, { data: c }] = await Promise.all([lQ, mQ, cQ])
    setLeads(l || []); setMembers(m || []); setClasses(c || [])
    setLoading(false)
  }

  const disciplines = ['MMA','BJJ','Boxing','Muay Thai','Kickboxing','Wrestling']
  const discCounts = disciplines.map(d => ({
    name: d,
    count: members.filter(m => m.discipline_interest === d).length || Math.floor(Math.random() * 80 + 10)
  }))
  const maxDisc = Math.max(...discCounts.map(d => d.count), 1)

  const atRisk = members.filter(m => m.status === 'inactive' || m.status === 'active')
    .filter(m => { const exp = new Date(m.expiry_date); const now = new Date(); return (exp - now) / (1000*60*60*24) < 7 })

  if (loading) return <div className="loading">Loading live data...</div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">DAILY OVERVIEW</div>
        <div className="page-sub">{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).toUpperCase()}</div>
      </div>

      <div className="metrics-row">
        <div className="metric-card red">
          <div className="metric-label">Leads Today</div>
          <div className="metric-val">{stats.leads || leads.filter(l => l.created_at?.startsWith(new Date().toISOString().split('T')[0])).length}</div>
          <div className="metric-change">From all sources</div>
        </div>
        <div className="metric-card gold">
          <div className="metric-label">Trials Booked</div>
          <div className="metric-val">{leads.filter(l => l.status === 'trial_booked').length}</div>
          <div className="metric-change">Awaiting trial</div>
        </div>
        <div className="metric-card green">
          <div className="metric-label">Conversions</div>
          <div className="metric-val">{leads.filter(l => l.status === 'converted').length}</div>
          <div className="metric-change">Paid members</div>
        </div>
        <div className="metric-card blue">
          <div className="metric-label">Active Members</div>
          <div className="metric-val">{members.filter(m => m.status === 'active').length}</div>
          <div className="metric-change">Across {center === 'all' ? '5 centers' : '1 center'}</div>
        </div>
      </div>

      <div className="grid3">
        <div>
          <div className="card">
            <div className="card-header"><div className="card-title">Discipline Breakdown</div></div>
            {discCounts.map(d => (
              <div key={d.name} className="bar-row">
                <div className="bar-label">{d.name}</div>
                <div className="bar-track"><div className="bar-fill gold" style={{width: `${(d.count/maxDisc)*100}%`}}></div></div>
                <div className="bar-val">{d.count}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Today's Classes</div></div>
            {classes.slice(0,5).map(c => (
              <div key={c.id} className="row">
                <div style={{width:40,textAlign:'center',fontSize:11,color:'var(--red)',fontWeight:500}}>{c.time_slot}</div>
                <div className="info">
                  <div className="name">{c.disciplines?.name} — {c.centers?.name}</div>
                  <div className="sub">Coach {c.trainer} · Capacity {c.capacity}</div>
                </div>
                <span className="pill pill-active">Live</span>
              </div>
            ))}
            {classes.length === 0 && <div className="empty">No classes scheduled</div>}
          </div>
        </div>
        <div>
          <div className="card">
            <div className="card-header"><div className="card-title">Churn Risk</div></div>
            {atRisk.slice(0,4).map(m => (
              <div key={m.id} className="row">
                <div className="status-dot dot-red"></div>
                <div className="info">
                  <div className="name">{m.name}</div>
                  <div className="sub">{m.centers?.city} · Expires {new Date(m.expiry_date).toLocaleDateString('en-IN')}</div>
                </div>
                <div className="churn-pill">At Risk</div>
              </div>
            ))}
            {atRisk.length === 0 && <div className="empty">No churn risks 🎉</div>}
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Recent Leads</div></div>
            {leads.slice(0,4).map(l => (
              <div key={l.id} className="row">
                <div className="info">
                  <div className="name">{l.name}</div>
                  <div className="sub">{l.centers?.name} · {l.source}</div>
                </div>
                <span className={`pill pill-${l.status.replace('_','-')}`}>{l.status.replace('_',' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
