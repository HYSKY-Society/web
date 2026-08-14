import { db } from '@/lib/db'
import { zeffyInvoices } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import PrintButton from './PrintButton'

const BRAND = '#3f11fa'

function pad(n: number) { return String(n).padStart(2, '0') }

function formatDate(d: Date): string {
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December']
  return `${months[d.getMonth()]} ${pad(d.getDate())}, ${d.getFullYear()}`
}

function formatAmount(amount: string, currency: string): string {
  const num = parseFloat(amount)
  if (isNaN(num)) return `${currency} ${amount}`
  return num.toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' })
}

function invoiceNumber(token: string, paidAt: Date): string {
  const d = `${paidAt.getFullYear()}${pad(paidAt.getMonth()+1)}${pad(paidAt.getDate())}`
  return `INV-${d}-${token.slice(0, 6).toUpperCase()}`
}

export default async function InvoiceTokenPage({ params }: { params: { token: string } }) {
  const [invoice] = await db
    .select()
    .from(zeffyInvoices)
    .where(eq(zeffyInvoices.token, params.token))

  if (!invoice) notFound()

  const invNum = invoiceNumber(invoice.token, invoice.paidAt)
  const today = new Date()

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Print button */}
      <div className="print:hidden flex justify-end p-4 border-b border-gray-200 bg-gray-50">
        <PrintButton />
      </div>

      <div className="max-w-2xl mx-auto p-10 print:p-0 print:max-w-full">

        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-purple.png" alt="HySky Society" className="h-14 w-auto mb-1" />
            <div className="text-xs text-gray-500">www.hysky.org</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold tracking-tight" style={{ color: BRAND }}>INVOICE</div>
            <div className="text-sm text-gray-500 mt-1">{invNum}</div>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex justify-between mb-8 text-sm">
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Invoice Date</div>
            <div className="text-gray-800 font-medium">{formatDate(today)}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Payment Date</div>
            <div className="text-gray-800 font-medium">{formatDate(invoice.paidAt)}</div>
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
          <div className="text-gray-900 font-semibold text-base">{invoice.name}</div>
          {invoice.org  && <div className="text-gray-700 text-sm">{invoice.org}</div>}
          <div className="text-gray-600 text-sm">{invoice.email}</div>
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
                <div className="font-medium">{invoice.eventName}</div>
                {invoice.zeffyOrderId && <div className="text-xs text-gray-400 mt-0.5">Order #{invoice.zeffyOrderId}</div>}
              </td>
              <td className="py-3 text-right text-gray-700">1</td>
              <td className="py-3 text-right text-gray-900 font-semibold">{formatAmount(invoice.amount, invoice.currency)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="pt-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-widest">Total</td>
              <td className="pt-4 text-right text-lg font-bold" style={{ color: BRAND }}>{formatAmount(invoice.amount, invoice.currency)}</td>
            </tr>
            <tr>
              <td colSpan={2} className="pt-1 text-right text-xs text-gray-400">Payment Received</td>
              <td className="pt-1 text-right text-xs font-semibold text-green-700">{formatAmount(invoice.amount, invoice.currency)}</td>
            </tr>
            <tr>
              <td colSpan={2} className="pt-1 text-right text-xs text-gray-400">Balance Due</td>
              <td className="pt-1 text-right text-xs font-semibold text-gray-800">$0.00</td>
            </tr>
          </tfoot>
        </table>

        {/* Payment note */}
        <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500 mb-8 print:bg-transparent print:border print:border-gray-200">
          Payment was processed securely via Zeffy on {formatDate(invoice.paidAt)}.
          HySky Society is a 501(c)(3) charitable nonprofit association. EIN 88-2447859
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 text-xs text-gray-400 text-center">
          HySky Society · www.hysky.org<br/>
          Questions? Email hysky@hysky.org
        </div>

      </div>
    </div>
  )
}
