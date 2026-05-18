'use client'
import { useEffect, useState } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 16 }, (_, i) => i + 7) // 7–22

export default function OccupancyHeatmap() {
  const [data, setData] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch('/api/admin/occupancy-heatmap')
      .then(r => r.json())
      .then(d => setData(d.data ?? {}))
      .catch(() => {})
  }, [])

  const max = Math.max(1, ...Object.values(data))

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `40px repeat(${HOURS.length}, 1fr)`, gap: 3, minWidth: 400 }}>
        {/* Header row */}
        <div />
        {HOURS.map(h => (
          <div key={h} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6rem', color: 'var(--muted)', textAlign: 'center' }}>
            {h}:00
          </div>
        ))}
        {/* Data rows */}
        {DAYS.map((day, d) => (
          <>
            <div key={day} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
              {day}
            </div>
            {HOURS.map(h => {
              const key = `${d}-${h}`
              const val = data[key] ?? 0
              const intensity = val / max
              return (
                <div key={key} title={`${val} bookings`} style={{
                  height: 20, borderRadius: 3,
                  background: intensity > 0
                    ? `rgba(28,58,46,${0.08 + intensity * 0.85})`
                    : 'rgba(201,169,110,0.06)',
                  cursor: 'default',
                }} />
              )
            })}
          </>
        ))}
      </div>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', color: 'var(--muted-light)', marginTop: 10 }}>
        Darker = more bookings. Last 90 days.
      </p>
    </div>
  )
}
