'use client'

import { useState } from 'react'
import { addSpeaker, addAgendaItem } from './actions'

const YEAR = 2026

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-white/40 mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#5d00f5]"

export function AddSpeakerForm() {
  const [name, setName]               = useState('')
  const [title, setTitle]             = useState('')
  const [org, setOrg]                 = useState('')
  const [bio, setBio]                 = useState('')
  const [avatarUrl, setAvatarUrl]     = useState('')
  const [sessionTitle, setSessionTitle] = useState('')
  const [order, setOrder]             = useState('0')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true); setError('')
    try {
      await addSpeaker({
        eventYear: YEAR,
        name: name.trim(),
        title: title.trim() || null,
        organization: org.trim() || null,
        bio: bio.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
        sessionTitle: sessionTitle.trim() || null,
        displayOrder: parseInt(order) || 0,
      })
      setName(''); setTitle(''); setOrg(''); setBio(''); setAvatarUrl(''); setSessionTitle('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl p-6" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)' }}>
      <h3 className="font-bold text-white">Add Speaker — FLYING HY {YEAR}</h3>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name *"><input value={name} onChange={e => setName(e.target.value)} required className={inputCls} placeholder="Jane Smith" /></Field>
        <Field label="Title"><input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} placeholder="Head of Propulsion" /></Field>
        <Field label="Organization"><input value={org} onChange={e => setOrg(e.target.value)} className={inputCls} placeholder="Acme Aerospace" /></Field>
        <Field label="Display Order"><input type="number" value={order} onChange={e => setOrder(e.target.value)} className={inputCls} placeholder="0" /></Field>
        <Field label="Session / Talk Title"><input value={sessionTitle} onChange={e => setSessionTitle(e.target.value)} className={inputCls} placeholder="The Road to H2 Certification" /></Field>
        <Field label="Avatar URL"><input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} className={inputCls} placeholder="https://..." /></Field>
        <div className="sm:col-span-2">
          <Field label="Bio">
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className={inputCls + ' resize-none'} placeholder="Short bio..." />
          </Field>
        </div>
      </div>
      <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: '#5d00f5' }}>
        {loading ? 'Adding…' : 'Add Speaker'}
      </button>
    </form>
  )
}

export function AddAgendaForm() {
  const [timeSlot, setTimeSlot]   = useState('')
  const [title, setTitle]         = useState('')
  const [desc, setDesc]           = useState('')
  const [speaker, setSpeaker]     = useState('')
  const [type, setType]           = useState('session')
  const [order, setOrder]         = useState('0')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true); setError('')
    try {
      await addAgendaItem({
        eventYear: YEAR,
        timeSlot: timeSlot.trim() || null,
        title: title.trim(),
        description: desc.trim() || null,
        speakerName: speaker.trim() || null,
        sessionType: type,
        displayOrder: parseInt(order) || 0,
      })
      setTimeSlot(''); setTitle(''); setDesc(''); setSpeaker(''); setOrder('0')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl p-6" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)' }}>
      <h3 className="font-bold text-white">Add Agenda Item — FLYING HY {YEAR}</h3>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Time Slot"><input value={timeSlot} onChange={e => setTimeSlot(e.target.value)} className={inputCls} placeholder="9:00 AM CT" /></Field>
        <div>
          <label className="block text-xs text-white/40 mb-1">Session Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className={inputCls}>
            <option value="session">Session</option>
            <option value="keynote">Keynote</option>
            <option value="panel">Panel</option>
            <option value="break">Break</option>
            <option value="networking">Networking</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <Field label="Title *"><input value={title} onChange={e => setTitle(e.target.value)} required className={inputCls} placeholder="Opening Keynote" /></Field>
        </div>
        <Field label="Speaker Name"><input value={speaker} onChange={e => setSpeaker(e.target.value)} className={inputCls} placeholder="Jane Smith" /></Field>
        <Field label="Display Order"><input type="number" value={order} onChange={e => setOrder(e.target.value)} className={inputCls} placeholder="0" /></Field>
        <div className="sm:col-span-2">
          <Field label="Description">
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} className={inputCls + ' resize-none'} placeholder="Brief description..." />
          </Field>
        </div>
      </div>
      <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: '#13dce8', color: '#000' }}>
        {loading ? 'Adding…' : 'Add Agenda Item'}
      </button>
    </form>
  )
}
