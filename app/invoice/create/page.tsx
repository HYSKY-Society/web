'use client'

import { useState } from 'react'

const DEFAULT_EVENT = 'FLYING HY Webinar — Hydrogen & Battery Electric Aviation'

export default function CreateInvoicePage() {
  const today = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    name:        '',
    org:         '',
    email:       '',
    billing:     '',
    amount:      '75',
    currency:    'USD',
    date:        '2026-06-09',
    event:       DEFAULT_EVENT,
    orderId:     '',
    invoiceDate: today,
  })

  const [copied, setCopied] = useState(false)

  function set(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function buildUrl(): string {
    const base = typeof window !== 'undefined' ? `${window.location.origin}/invoice` : '/invoice'
    const p = new URLSearchParams()
    if (form.name)        p.set('name',        form.name)
    if (form.org)         p.set('org',         form.org)
    if (form.email)       p.set('email',       form.email)
    if (form.billing)     p.set('billing',     form.billing)
    if (form.amount)      p.set('amount',      form.amount)
    if (form.currency)    p.set('currency',    form.currency)
    if (form.date)        p.set('date',        form.date)
    if (form.event)       p.set('event',       form.event)
    if (form.orderId)     p.set('orderId',     form.orderId)
    if (form.invoiceDate) p.set('invoiceDate', form.invoiceDate)
    return `${base}?${p.toString()}`
  }

  async function copy() {
    await navigator.clipboard.writeText(buildUrl())
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const url = buildUrl()

  const field = (label: string, key: keyof typeof form, type = 'text', placeholder = '') => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={form[key]}
        placeholder={placeholder}
        onChange={e => set(key, e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-indigo-900 mb-1">Generate Invoice Link</h1>
        <p className="text-sm text-gray-500 mb-8">Fill in the registration details to create a shareable invoice URL.</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4">
          {field('Registrant Name', 'name', 'text', 'Marijn Giesbert')}
          {field('Organization', 'org', 'text', 'Royal NLR – Netherlands Aerospace Centre')}
          {field('Registrant Email', 'email', 'email', 'marijn.giesbert@nlr.nl')}
          {field('Billing Email (if different)', 'billing', 'email', 'erna.hurkmans@nlr.nl')}

          <div className="grid grid-cols-2 gap-4">
            {field('Amount', 'amount', 'number')}
            {field('Currency', 'currency', 'text', 'USD')}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field('Payment Date', 'date', 'date')}
            {field('Invoice Date', 'invoiceDate', 'date')}
          </div>

          {field('Event Name', 'event', 'text')}
          {field('Zeffy Order ID (optional)', 'orderId', 'text', 'Leave blank if unknown')}
        </div>

        {/* Preview & copy */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Invoice URL</div>
          <div className="text-xs text-indigo-700 break-all font-mono bg-indigo-50 rounded p-3 mb-3 select-all">
            {url}
          </div>
          <div className="flex gap-3">
            <button
              onClick={copy}
              className="flex-1 py-2 px-4 bg-indigo-700 text-white text-sm font-semibold rounded-lg hover:bg-indigo-800 transition-colors"
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-4 border border-indigo-700 text-indigo-700 text-sm font-semibold rounded-lg hover:bg-indigo-50 transition-colors text-center"
            >
              Preview Invoice
            </a>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Send this link to the registrant or their billing contact. They click &quot;Save as PDF / Print&quot; to download.
        </p>
      </div>
    </div>
  )
}
