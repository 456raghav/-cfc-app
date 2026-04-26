import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Reports({ center }) {
  const [leads, setLeads] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [center])

  async function fetchData() {
    setLoading(true)
    let lQ = supabase.from('leads').select('*')
    let mQ = supabase.from('members').select('*, centers(name, city)')
    if (center !== 'all') { lQ = lQ.eq('center_id', center); mQ = mQ.eq('home_center_id', center) }
    const [{ data: l }, { data: m }] = await Promise.all([lQ, mQ])
    setLeads(l || []); setMembers(m || [])
    setLoading(false)
  }

  const total = leads.length || 1
  const trialRate = Math.round((leads.filter(l => ['trial_booked','attended','converted'].includes(l.status)).length / total) * 100)
  const convRate = Math.round((leads.filter(l => l.status === 'converted').length / Math.max(leads.filter(l => l.status === 'attended').length, 1)) * 100)
  const activeRate = Math.round((members.filter(m => m.status === 'active').length / Math.max(members.length, 1)) * 100)

  const revenue = members.reduce((sum, m) => sum + (m.plan_price || 0), 0)

  const byCenter = {}
  members.forEach(m => {
    const city = m.centers?.city || 'Unknown'
    byCenter[city] = (byCenter[city] || 0) + (m.plan_price || 0)
  })
  const centerRevenue = Object.entries(byCenter).sort((a,b) => b[1]-a[1])
  const maxRev = Math.max(...centerRevenue.map(c => c[1]), 1)

  const sourceCount = {}
  leads.forEach(l => { sourceCount[l.source || 'Unknown'] = (sourceCount[l.source || 'Unknown'] || 0) + 1 })
  const sources = Object.entries(sourceCount).sort((a,b) => b[1]-a[1])
  const maxSrc = Math.max(...sources.map(s => s[1]), 1)

  if (loading) return <div className="loading">Loading analytics...</div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">ANALYTICS</div>
        <div className="page-sub">{new Date().toLocaleString('en-IN', { month:'long', year:'numeric' }).toUpperCase()}</div>
      </div>

      <div className="metrics-row">
        <div className="metric-card red">
          <div className="metric-label">Lead → Trial</div>
          <div className="metric-val">{trialRate}%</div>
          <div className="metric-change">Conversion rate</div>
        </div>
        <div className="metric-card gold">
          <div className="metric-label">Trial → Paid</div>
          <div className="metric-val">{convRate || 0}%</div>
          <div className="metric-change">Closing rate</div>
        </div>
        <div className="metric-card green">
          <div className="metric-label">Retention</div>
          <div className="metric-val">{activeRate}%</div>
          <div className="metric-change">Active members</div>
        </div>
        <div className="metric-card blue">
          <div className="metric-label">Total Revenue</div>
          <div className="metric-val" style={{fontSize:24}}>₹{(revenue/1000).toFixed(0)}K</div>
          <div className="metric-change">Across all plans</div>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-header"><div className="card-title">Revenue by Center</div></div>
          {centerRevenue.map(([city, rev]) => (
            <div key={city} className="bar-row">
              <div className="bar-label" style={{width:80}}>{city}</div>
              <div className="bar-track"><div className="bar-fill gold" style={{width:`${(rev/maxRev)*100}%`}}></div></div>
              <div className="bar-val" style={{width:60,color:'var(--gold-light)'}}>₹{(rev/1000).toFixed(0)}K</div>
            </div>
          ))}
          {centerRevenue.length === 0 && <div className="empty">No revenue data yet</div>}
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Lead Sources</div></div>
          {sources.map(([source, count]) => (
            <div key={source} className="bar-row">
              <div className="bar-label" style={{width:80}}>{source}</div>
              <div className="bar-track"><div className="bar-fill" style={{width:`${(count/maxSrc)*100}%`}}></div></div>
              <div className="bar-val">{count}</div>
            </div>
          ))}
          {sources.length === 0 && <div className="empty">No lead data yet</div>}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Membership Plan Breakdown</div></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
          {['1-Month','3-Month','6-Month'].map(plan => {
            const count = members.filter(m => m.plan === plan).length
            const rev = members.filter(m => m.plan === plan).reduce((s,m) => s+(m.plan_price||0), 0)
            return (
              <div key={plan} style={{background:'var(--surface2)',borderRadius:8,padding:14,textAlign:'center'}}>
                <div style={{fontFamily:'var(--font-d)',fontSize:28,color:'var(--text)'}}>{count}</div>
                <div style={{fontSize:10,letterSpacing:1.5,textTransform:'uppercase',color:'var(--text-muted)',margin:'4px 0'}}>{plan}</div>
                <div style={{fontSize:11,color:'var(--gold-light)'}}>₹{rev.toLocaleString('en-IN')}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
