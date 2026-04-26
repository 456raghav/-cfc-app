// FOLLOWUPS PAGE
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function Followups({ center }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchFollowups() }, [center])

  async function fetchFollowups() {
    setLoading(true)
    const { data } = await supabase
      .from('follow_ups')
      .select('*, leads(name, discipline_interest, centers(name)), members(name)')
      .eq('done', false)
      .order('due_date')
    setItems(data || [])
    setLoading(false)
  }

  async function markDone(id) {
    await supabase.from('follow_ups').update({ done: true }).eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  // Generate smart follow-ups from leads data if none exist
  async function generateFollowups() {
    const { data: leads } = await supabase.from('leads')
      .select('*').in('status', ['attended', 'trial_booked'])
    const { data: members } = await supabase.from('members')
      .select('*').eq('status', 'inactive')

    const inserts = []
    leads?.forEach(l => inserts.push({
      lead_id: l.id,
      type: l.status === 'attended' ? 'post_trial' : 'pre_trial',
      due_date: new Date().toISOString().split('T')[0],
      done: false
    }))
    members?.forEach(m => inserts.push({
      member_id: m.id,
      type: 'reengage',
      due_date: new Date().toISOString().split('T')[0],
      done: false
    }))

    if (inserts.length > 0) {
      await supabase.from('follow_ups').insert(inserts)
      fetchFollowups()
    }
  }

  const typeStyles = {
    post_trial: { label: 'Post Trial', bg: 'rgba(200,16,46,0.15)', color: '#F08898' },
    pre_trial: { label: 'Pre Trial', bg: 'rgba(48,120,200,0.15)', color: '#80B8F8' },
    renewal: { label: 'Renewal', bg: 'rgba(212,160,23,0.15)', color: '#E8C860' },
    reengage: { label: 'Re-engage', bg: 'rgba(100,100,100,0.15)', color: '#AAA' },
    call: { label: 'Call', bg: 'rgba(200,16,46,0.15)', color: '#F08898' },
  }

  if (loading) return <div className="loading">Loading follow-ups...</div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">FOLLOW-UP QUEUE</div>
        <div className="page-sub">{items.length} PENDING TODAY</div>
        <button className="btn btn-ghost" style={{marginLeft:'auto'}} onClick={generateFollowups}>⚡ Auto Generate</button>
      </div>
      <div className="card">
        {items.length === 0 && (
          <div style={{textAlign:'center',padding:'40px 20px'}}>
            <div style={{fontSize:32,marginBottom:8}}>🎉</div>
            <div style={{color:'var(--text-muted)',fontSize:13}}>All caught up! No pending follow-ups.</div>
            <button className="btn btn-red" style={{marginTop:12}} onClick={generateFollowups}>Generate Smart Follow-ups</button>
          </div>
        )}
        {items.map(item => {
          const style = typeStyles[item.type] || typeStyles.call
          const name = item.leads?.name || item.members?.name || 'Unknown'
          const reason = item.type === 'post_trial' ? 'Attended trial — follow up to convert'
            : item.type === 'pre_trial' ? 'Trial booked — confirm attendance'
            : item.type === 'reengage' ? 'Member went inactive — re-engage'
            : item.type === 'renewal' ? 'Membership expiring soon'
            : 'Follow up required'
          return (
            <div key={item.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{fontSize:9,fontWeight:500,letterSpacing:1,textTransform:'uppercase',padding:'3px 7px',borderRadius:3,background:style.bg,color:style.color,whiteSpace:'nowrap'}}>
                {style.label}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{name}</div>
                <div style={{fontSize:11,color:'var(--text-muted)'}}>{reason}</div>
              </div>
              <div style={{fontSize:11,color:'var(--text-dim)',whiteSpace:'nowrap'}}>Today</div>
              <button className="btn btn-ghost" onClick={() => markDone(item.id)}>Done ✓</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Followups
