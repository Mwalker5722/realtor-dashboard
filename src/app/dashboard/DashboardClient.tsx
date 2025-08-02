'use client'

import { useState, useTransition } from 'react'
import { DateRange } from 'react-day-picker'
import { addDays } from 'date-fns'
import { getMetricsForDateRange } from './actions'
import { DatePickerWithRange } from '@/components/ui/DatePicker'
import LogoutButton from './LogoutButton'

// Define the shape of our props
interface DashboardClientProps {
  userEmail: string
  initialMetrics: {
    leads: number | null
    spend: number | null
  }[]
}

export default function DashboardClient({
  userEmail,
  initialMetrics,
}: DashboardClientProps) {
  const [isPending, startTransition] = useTransition()
  const [metrics, setMetrics] = useState(initialMetrics)
  const past30Days: DateRange = {
    from: addDays(new Date(), -29),
    to: new Date(),
  }
  const [range, setRange] = useState<DateRange | undefined>(past30Days)

  const totalLeads = metrics.reduce((acc, metric) => acc + (metric.leads || 0), 0)
  const totalSpend = metrics.reduce(
    (acc, metric) => acc + (metric.spend || 0),
    0
  )

  const handleDateSelect = (selectedRange: DateRange | undefined) => {
    if (selectedRange?.from && selectedRange?.to) {
      setRange(selectedRange)
      startTransition(async () => {
        const newMetrics = await getMetricsForDateRange(
          selectedRange as { from: Date; to: Date }
        )
        setMetrics(newMetrics)
      })
    }
  }

  return (
    <div className="w-full max-w-6xl">
      {/* NEW: A single header container for proper alignment and style */}
      <header className="flex flex-wrap items-center justify-between gap-4 p-4 mb-8 bg-white border border-gray-200 rounded-lg shadow-sm">
        {/* Left side of header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
          <p className="text-sm text-gray-500">
            {userEmail}
          </p>
        </div>
        {/* Right side of header */}
        <div className="flex items-center flex-shrink-0 gap-2 md:gap-4">
          <DatePickerWithRange date={range} setDate={handleDateSelect} />
          <LogoutButton />
        </div>
      </header>

      {/* KPI Cards Section (no changes here) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
          <p
            className={`mt-2 text-4xl font-bold text-gray-900 transition-opacity ${
              isPending ? 'opacity-50' : 'opacity-100'
            }`}
          >
            {totalLeads}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Ad Spend</h3>
          <p
            className={`mt-2 text-4xl font-bold text-gray-900 transition-opacity ${
              isPending ? 'opacity-50' : 'opacity-100'
            }`}
          >
            ${totalSpend?.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  )
}