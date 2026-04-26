import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const STAGES = [
  { key: 'new', label: 'New', color: 'var(--red)' },
  { key: 'called', label: 'Called', color: 'var(--text-muted)' },
  { key: 'trial_booked', label: 'Trial Booked', color: 'var(--gold-light)' },
  { key: 'attended', label: 'Attended', color: '#80B8F8' },
  { key: 'converted', label: 'Converted', color: '#4CAF50' },
  { key: 'lost', label: 'Lost', color: '#555' },
]

export default function Pipeline({ center }) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchLeads() }, [center])

  async function fetchLeads() {
    setLoading(true)
    let q = supabase.from('leads').select('*, centers(name, city)').order('created_at', { ascending: false })
    if (center !== 'all') q = q.eq('center_id', center)
    const { data } = await q
    setLeads(data || [])
    setLoading(false)
  }

  async function moveStage(leadId, newStatus) {
    await supabase.from('leads').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', leadId)
    fetchLeads()
  }

  async function addLead() {
    const name = prompt('Lead name:')
    if (!name) return
    const phone = prompt('Phone number:')
    const source = prompt('Source (Instagram/Google/Friend/Facebook/Walk-in):') || 'Walk-in'
    const discipline = prompt('Discipline interest (BJJ/MMA/Boxing/Muay Thai/Kickboxing/Wrestling):') || 'MMA'
    await supabase.from('leads').insert({ name, phone, source, discipline_interest: discipline, status: 'new' })
    fetchLeads()
  }

  if (loading) return <div className="loading">Loading pipeline...</div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">LEAD PIPELINE</div>
        <div className="page-sub">{leads.length} TOTAL LEADS</div>
        <button className="btn btn-red" style={{marginLeft:'auto'}} onClick={addLead}>+ Add Lead</button>
      </div>

      <div className="kanban">
        {STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.status === stage.key)
          return (
            <div key={stage.key} className="kol">
              <div className="kol-head" style={{color: stage.color}}>
                {stage.label}
                <div className="kol-count">{stageLeads.length}</div>
              </div>
              {stageLeads.map(lead => (
                <div key={lead.id} className="lead-card">
                  <div className="lead-name">{lead.name}</div>
                  <div className="lead-meta">{lead.centers?.city || 'Delhi'} · {lead.source}</div>
                  <div className="lead-tag">{lead.discipline_interest || 'MMA'}</div>
                  <div style={{marginTop:8, display:'flex', gap:4, flexWrap:'wrap'}}>
                    {STAGES.filter(s => s.key !== stage.key).map(s => (
                      <button key={s.key} className="btn btn-ghost" style={{fontSize:9,padding:'2px 6px'}}
                        onClick={() => moveStage(lead.id, s.key)}>
                        → {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {stageLeads.length === 0 && <div className="empty" style={{padding:20,fontSize:11}}>Empty</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
