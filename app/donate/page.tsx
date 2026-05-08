import { ZEFFY } from '@/lib/zeffy'

export default function DonatePage() {
  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #04030a 0%, #0a0520 100%)' }}>
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-5 bg-[#5d00f5]/20 text-[#9b6dff]">
            💚 Support Our Mission
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">Save the Skies</h1>
          <p className="text-white/55 text-lg leading-relaxed max-w-xl mx-auto">
            Your donation helps HYSKY Society advance hydrogen aviation — accelerating the path to zero-emission flight for future generations.
          </p>
        </div>

        {/* Impact stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { value: '240+', label: 'Members' },
            { value: '18', label: 'Countries' },
            { value: '6', label: 'Working Groups' },
          ].map((s) => (
            <div key={s.label} className="text-center bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-white/40 text-xs uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Zeffy donation form */}
        <div className="rounded-2xl overflow-hidden border border-white/10" style={{ height: '640px' }}>
          <div style={{ position: 'relative', overflow: 'hidden', height: '100%', width: '100%' }}>
            <iframe
              title="Donate to HYSKY Society"
              src={ZEFFY.donate}
              style={{ position: 'absolute', border: 0, top: 0, left: 0, bottom: 0, right: 0, width: '100%', height: '100%' }}
              allowTransparency={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
