import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Members({ center }) {
  const [members, setMembers] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchMembers() }, [center])

  async function fetchMembers() {
    setLoading(true)
    let q = supabase.from('members').select('*, centers(name, city)').order('created_at', { ascending: false })
    if (center !== 'all') q = q.eq('home_center_id', center)
    const { data } = await q
    setMembers(data || [])
    setLoading(false)
  }

  async function addMember() {
    const name = prompt('Member name:')
    if (!name) return
    const phone = prompt('Phone:')
    const plan = prompt('Plan (1-Month / 3-Month / 6-Month):') || '1-Month'
    const planPrice = plan === '3-Month' ? 9000 : plan === '6-Month' ? 16000 : 3500
    const expiry = new Date()
    expiry.setMonth(expiry.getMonth() + (plan === '1-Month' ? 1 : plan === '3-Month' ? 3 : 6))
    await supabase.from('members').insert({
      name, phone, plan, plan_price: planPrice,
      joined_date: new Date().toISOString().split('T')[0],
      expiry_date: expiry.toISOString().split('T')[0],
      status: 'active'
    })
    fetchMembers()
  }

  const getInitials = name => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || '??'

  const getDaysLeft = expiry => {
    const diff = (new Date(expiry) - new Date()) / (1000*60*60*24)
    return Math.round(diff)
  }

  const filtered = members.filter(m => {
    const matchStatus = filter === 'all' || m.status === filter
    const matchSearch = !search || m.name?.toLowerCase().includes(search.toLowerCase()) || m.phone?.includes(search)
    return matchStatus && matchSearch
  })

  if (loading) return <div className="loading">Loading members...</div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">ALL MEMBERS</div>
        <div className="page-sub">{members.filter(m => m.status === 'active').length} ACTIVE</div>
        <button className="btn btn-red" style={{marginLeft:'auto'}} onClick={addMember}>+ Add Member</button>
      </div>

      <div style={{display:'flex',gap:8,marginBottom:16,alignItems:'center'}}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name or phone..."
          style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:6,padding:'7px 12px',color:'var(--text)',fontSize:13,fontFamily:'var(--font-b)',flex:1,maxWidth:280}}
        />
        {['all','active','inactive','trial'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-red' : 'btn-ghost'}`}
            style={{textTransform:'capitalize'}} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Members ({filtered.length})</div>
        </div>
        {filtered.map(m => {
          const daysLeft = getDaysLeft(m.expiry_date)
          return (
            <div key={m.id} className="row">
              <div className={`avatar ${m.status === 'active' ? 'active' : ''}`}>{getInitials(m.name)}</div>
              <div className="info">
                <div className="name">{m.name}</div>
                <div className="sub">{m.centers?.city || 'Delhi'} · {m.plan} · {m.phone}</div>
              </div>
              <div style={{textAlign:'right',marginRight:8}}>
                <div style={{fontSize:11,color: daysLeft < 7 ? 'var(--gold-light)' : 'var(--text-muted)'}}>
                  {daysLeft > 0 ? `${daysLeft}d left` : 'Expired'}
                </div>
                <div style={{fontSize:10,color:'var(--text-dim)'}}>₹{m.plan_price?.toLocaleString('en-IN')}</div>
              </div>
              <span className={`pill pill-${m.status}`}>{m.status}</span>
            </div>
          )
        })}
        {filtered.length === 0 && <div className="empty">No members found</div>}
      </div>
    </div>
  )
}
