'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ... dateRangeSchema is the same ...
const dateRangeSchema = z.object({
  from: z.date(),
  to: z.date(),
})


export async function getMetricsForDateRange(range: { from: Date; to: Date }) {
  // ... date parsing is the same ...
  const parsedRange = dateRangeSchema.safeParse(range)
  if (!parsedRange.success) {
    throw new Error('Invalid date range provided.')
  }

  const supabase = createClient() // Corrected

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated.')
  }

  // ... rest of the file is the same ...
  const { data, error } = await supabase
    .from('client_metrics')
    .select('leads, spend')
    .eq('client_id', user.id)
    .gte('report_date', parsedRange.data.from.toISOString())
    .lte('report_date', parsedRange.data.to.toISOString())

  if (error) {
    console.error('Error fetching metrics:', error)
    throw new Error('Could not fetch metrics.')
  }

  revalidatePath('/dashboard')
  return data
}
