'use client'

import { ChangeEvent, useRef, useState } from 'react'

type ZohoOnlyContact = { id: string; name: string; emails: string[] }
type ImportResult = {
  connectAccountsChecked: number
  zohoContactsChecked: number
  matched: number
  unmatched: number
  ambiguous: number
  zohoWithoutConnectCount: number
  zohoWithoutConnect: ZohoOnlyContact[]
  error?: string
}

export default function ZohoImportButton() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'importing' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<ImportResult | null>(null)
  const [message, setMessage] = useState('')

  const importSnapshot = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setStatus('importing')
    setResult(null)
    setMessage('')
    try {
      const snapshot = JSON.parse(await file.text()) as unknown
      const response = await fetch('/api/admin/import-zoho', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(snapshot),
      })
      const payload = await response.json() as ImportResult
      if (!response.ok) throw new Error(payload.error ?? 'Zoho snapshot import failed.')
      setResult(payload)
      setStatus('done')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Zoho snapshot import failed.')
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={importSnapshot}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={status === 'importing'}
        className="rounded-lg border border-[#13dce8]/50 bg-[#13dce8]/10 px-4 py-2.5 text-sm font-semibold text-[#13dce8] transition-colors hover:bg-[#13dce8]/20 disabled:cursor-wait disabled:opacity-60"
      >
        {status === 'importing' ? 'Importing…' : 'Import Zoho Snapshot'}
      </button>
      {status === 'error' && <p className="max-w-sm text-right text-xs text-red-400">{message}</p>}
      {result && (
        <details className="max-w-md rounded-xl border border-white/10 bg-black/20 p-3 text-left text-xs text-white/65">
          <summary className="cursor-pointer font-semibold text-green-300">
            Imported details for {result.matched} existing Connect accounts
          </summary>
          <div className="mt-3 space-y-1">
            <p>{result.connectAccountsChecked} Connect accounts checked</p>
            <p>{result.zohoContactsChecked} Zoho contacts checked</p>
            <p>{result.unmatched} Connect accounts had no Zoho match</p>
            <p>{result.ambiguous} matches need manual review</p>
            <p className="pt-2 font-semibold text-amber-300">
              {result.zohoWithoutConnectCount} Zoho contacts do not have a Connect account
            </p>
            {result.zohoWithoutConnect.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-black/20 p-2">
                {result.zohoWithoutConnect.map((contact) => (
                  <p key={contact.id} className="border-b border-white/5 py-1 last:border-0">
                    {contact.name} — {contact.emails.join(', ')}
                  </p>
                ))}
              </div>
            )}
            <p className="pt-2 text-white/35">No accounts were created and no member-entered fields were changed.</p>
          </div>
        </details>
      )}
    </div>
  )
}
