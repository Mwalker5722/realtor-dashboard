// src/app/dashboard/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache' // 1. Import revalidatePath

const dateRangeSchema = z.object({
  from: z.date(),
  to: z.date(),
})

export async function getMetricsForDateRange(range: { from: Date; to: Date }) {
  const parsedRange = dateRangeSchema.safeParse(range);
  if (!parsedRange.success) {
    throw new Error("Invalid date range provided.");
  }
  
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated.");
  }

  const { data, error } = await supabase
    .from('client_metrics')
    .select('leads, spend')
    .eq('client_id', user.id)
    .gte('report_date', parsedRange.data.from.toISOString())
    .lte('report_date', parsedRange.data.to.toISOString())

  if (error) {
    console.error("Error fetching metrics:", error)
    throw new Error("Could not fetch metrics.");
  }

  revalidatePath('/dashboard') // 2. Add this line to clear the cache
  return data
}