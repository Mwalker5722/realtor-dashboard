import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardClient from './DashboardClient'
import { addDays } from 'date-fns'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/')
  }

  const to = new Date()
  const from = addDays(to, -29)
  const { data: initialMetrics } = await supabase
    .from('client_metrics')
    .select('leads, spend')
    .eq('client_id', user.id)
    .gte('report_date', from.toISOString())
    .lte('report_date', to.toISOString())

  return (
    <div className="flex justify-center w-full min-h-screen bg-gray-100 p-4 md:p-8">
      <DashboardClient
        userEmail={user.email || 'No email found'}
        initialMetrics={initialMetrics || []}
      />
    </div>
  )
}
