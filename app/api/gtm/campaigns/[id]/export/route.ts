import { NextResponse } from 'next/server'
import Papa from 'papaparse'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Lead } from '@/lib/types/gtm'

const EXPORT_COLUMNS = [
  'name', 'email', 'company', 'location', 'source', 'linkedin_url',
  'twitter_handle', 'github_username', 'bio', 'tags', 'icp_match_score',
  'status', 'created_at',
] as const

// PostgREST caps a single response around 1000 rows regardless of .limit(),
// and campaigns accumulate leads daily (see SOURCE_LIMITS in
// app/api/gtm/cron/scrape/route.ts) — a mature campaign can exceed that. Page
// through with .range() so the export is never silently truncated.
const PAGE_SIZE = 1000

async function fetchAllLeads(campaignId: string): Promise<Lead[]> {
  const leads: Lead[] = []
  let from = 0

  while (true) {
    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (error) throw error
    if (!data?.length) break

    leads.push(...(data as Lead[]))
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return leads
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data: campaign, error: campaignError } = await supabaseAdmin
    .from('campaigns')
    .select('id, name')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (campaignError || !campaign) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let leads: Lead[]
  try {
    leads = await fetchAllLeads(id)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const rows = leads.map(l => ({
    name: l.name,
    email: l.email,
    company: l.company,
    location: l.location,
    source: l.source,
    linkedin_url: l.linkedin_url,
    twitter_handle: l.twitter_handle,
    github_username: l.github_username,
    bio: l.bio,
    tags: (l.tags ?? []).join('; '),
    icp_match_score: l.icp_match_score,
    status: l.status,
    created_at: l.created_at,
  }))

  const csv = Papa.unparse({ fields: [...EXPORT_COLUMNS], data: rows })

  const filename = `${campaign.name}-leads.csv`
    // strip characters that could break the Content-Disposition header
    .replace(/[^\w.\- ]/g, '')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, max-age=0',
    },
  })
}
