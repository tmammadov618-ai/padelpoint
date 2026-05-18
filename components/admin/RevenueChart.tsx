'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'

export default function AdminRevenueChart({ data }: { data: { starts_at: string; final_price_azn: number }[] }) {
  // Aggregate by day
  const byDay: Record<string, number> = {}
  for (const b of data) {
    const day = b.starts_at.split('T')[0]
    byDay[day] = (byDay[day] ?? 0) + Number(b.final_price_azn)
  }
  const chartData = Object.entries(byDay).map(([day, revenue]) => ({
    day: format(parseISO(day), 'MMM d'),
    revenue: Math.round(revenue),
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#1C3A2E" stopOpacity={0.15}/>
            <stop offset="95%" stopColor="#1C3A2E" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="day" tick={{ fontFamily: 'Jost', fontSize: 11, fill: '#9B8E82' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontFamily: 'Jost', fontSize: 11, fill: '#9B8E82' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ fontFamily: 'Jost', fontSize: 12, background: '#FDFAF5', border: '1px solid #E8D5B0', borderRadius: 8 }}
          formatter={(v: number) => [`${v} AZN`, 'Revenue']}
        />
        <Area type="monotone" dataKey="revenue" stroke="#1C3A2E" strokeWidth={2} fill="url(#revenueGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
