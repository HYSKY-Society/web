'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function pad(n: number) { return String(n).padStart(2, '0') }

function invoiceNumber(orderId: string | null, name: string, date: string): string {
  if (orderId) return `INV-${orderId.toUpperCase().slice(0, 8)}`
  // deterministic fallback: YYYYMMDD + initials
  const initials = name.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 3)
  const d = date.replace(/-/g, '').slice(0, 8)
  return `INV-${d}-${initials}`
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December']
  return `${months[(m ?? 1) - 1]} ${pad(d ?? 1)}, ${y}`
}

function formatAmount(amount: string, currency: string): string {
  const num = parseFloat(amount)
  if (isNaN(num)) return `${currency} ${amount}`
  return num.toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' })
}

function InvoiceContent() {
  const params = useSearchParams()

  const name      = params.get('name')      ?? ''
  const org       = params.get('org')       ?? ''
  const email     = params.get('email')     ?? ''
  const billing   = params.get('billing')   ?? ''       // alternative billing email
  const amount    = params.get('amount')    ?? '0'
  const currency  = params.get('currency')  ?? 'USD'
  const date      = params.get('date')      ?? new Date().toISOString().slice(0,10)
  const event     = params.get('event')     ?? 'Event Registration'
  const orderId   = params.get('orderId')   ?? null
  const invDate   = params.get('invoiceDate') ?? new Date().toISOString().slice(0,10)

  const invNum = invoiceNumber(orderId, name, date)

  const missing = !name && !email
  if (missing) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 text-sm">
        No invoice data found. Please use the link provided in your registration email.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Print button — hidden when printing */}
      <div className="print:hidden flex justify-end p-4 border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-700 text-white text-sm font-semibold rounded-lg hover:bg-indigo-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a1 1 0 001-1v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4a1 1 0 001 1zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Save as PDF / Print
        </button>
      </div>

      {/* Invoice */}
      <div className="max-w-2xl mx-auto p-10 print:p-0 print:max-w-full">

        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-new.png"
              alt="HYSKY Society"
              className="h-14 w-auto mb-1"
            />
            <div className="text-xs text-gray-500">admin@hysky.org · hysky.org</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold text-indigo-900 tracking-tight">INVOICE</div>
            <div className="text-sm text-gray-600 mt-1">{invNum}</div>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex justify-between mb-8 text-sm">
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Invoice Date</div>
            <div className="text-gray-800 font-medium">{formatDate(invDate)}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Payment Date</div>
            <div className="text-gray-800 font-medium">{formatDate(date)}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Status</div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
              PAID
            </span>
          </div>
        </div>

        <hr className="border-gray-200 mb-8" />

        {/* Bill To */}
        <div className="mb-8">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Bill To</div>
          {name    && <div className="text-gray-900 font-semibold text-base">{name}</div>}
          {org     && <div className="text-gray-700 text-sm">{org}</div>}
          {(billing || email) && <div className="text-gray-600 text-sm">{billing || email}</div>}
        </div>

        {/* Line items */}
        <table className="w-full text-sm mb-8">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-widest pb-2">Description</th>
              <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-widest pb-2">Qty</th>
              <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-widest pb-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 text-gray-800">
                <div className="font-medium">{event}</div>
                {orderId && <div className="text-xs text-gray-400 mt-0.5">Order #{orderId}</div>}
              </td>
              <td className="py-3 text-right text-gray-700">1</td>
              <td className="py-3 text-right text-gray-900 font-semibold">{formatAmount(amount, currency)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="pt-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-widest">Total</td>
              <td className="pt-4 text-right text-lg font-bold text-indigo-900">{formatAmount(amount, currency)}</td>
            </tr>
            <tr>
              <td colSpan={2} className="pt-1 text-right text-xs text-gray-400">Payment Received</td>
              <td className="pt-1 text-right text-xs font-semibold text-green-700">{formatAmount(amount, currency)}</td>
            </tr>
            <tr>
              <td colSpan={2} className="pt-1 text-right text-xs text-gray-400">Balance Due</td>
              <td className="pt-1 text-right text-xs font-semibold text-gray-800">$0.00</td>
            </tr>
          </tfoot>
        </table>

        {/* Payment note */}
        <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500 mb-8 print:bg-transparent print:border print:border-gray-200">
          Payment was processed securely via Zeffy on {formatDate(date)}. This invoice serves as your official receipt.
          HYSKY Society is a 501(c)(6) trade association. EIN on file — contact admin@hysky.org for tax documentation.
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 text-xs text-gray-400 text-center">
          HYSKY Society · admin@hysky.org · hysky.org<br/>
          Questions? Email admin@hysky.org
        </div>

      </div>
    </div>
  )
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">Loading…</div>}>
      <InvoiceContent />
    </Suspense>
  )
}
