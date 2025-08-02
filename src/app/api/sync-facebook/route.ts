// src/app/api/sync-facebook/route.ts
import { createClient } from '@/lib/supabase/server'
import { formatInTimeZone } from 'date-fns-tz'
import { NextResponse } from 'next/server'

export async function GET() {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN
  if (!accessToken) {
    return NextResponse.json(
      { error: 'Missing Facebook Access Token.' },
      { status: 500 }
    )
  }

  // THE FIX IS HERE: We destructure `supabase` from the returned object.
  const { supabase } = createClient()

  // 1. Get all clients from your new 'clients' table
  const { data: clients, error: clientError } = await supabase
    .from('clients')
    .select('user_id, ad_account_id')

  if (clientError) {
    console.error('Error fetching clients:', clientError)
    return NextResponse.json({ error: 'Could not fetch clients.' }, { status: 500 })
  }

  // 2. Loop through each client and sync their data
  const timeZone = 'America/New_York' // Your reporting timezone
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const dateStr = formatInTimeZone(yesterday, timeZone, 'yyyy-MM-dd')
  
  const results = []

  for (const client of clients) {
    const { user_id, ad_account_id } = client
    const fields = 'spend,results'
    const url = `https://graph.facebook.com/v20.0/${ad_account_id}/insights?level=account&fields=${fields}&time_range={'since':'${dateStr}','until':'${dateStr}'}&access_token=${accessToken}`

    try {
      const fbResponse = await fetch(url)
      const fbData = await fbResponse.json()

      if (!fbResponse.ok || !fbData.data || fbData.data.length === 0) {
        console.warn(`No data for ad account ${ad_account_id}. Skipping.`)
        continue // Skip to the next client
      }

      const insights = fbData.data[0]
      const spend = insights?.spend ? parseFloat(insights.spend) : 0
      const leads = insights?.results ? parseInt(insights.results, 10) : 0

      // 3. Upsert the data for the specific client
      const { error: upsertError } = await supabase.from('client_metrics').upsert({
        client_id: user_id, // Use the user_id from the clients table
        report_date: dateStr,
        leads: leads,
        spend: spend,
      }, { onConflict: 'client_id, report_date' })

      if (upsertError) {
        console.error(`Supabase Upsert Error for ${ad_account_id}:`, upsertError)
      } else {
        results.push({ ad_account_id, status: 'success', leads, spend })
      }
    } catch (error) {
      console.error(`Sync Job Failed for ${ad_account_id}:`, error)
      results.push({ ad_account_id, status: 'failed' })
    }
  }

  return NextResponse.json({ success: true, results })
}
