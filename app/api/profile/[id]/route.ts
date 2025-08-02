import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: profileId } = await params

    console.log(`🔍 Looking for profile with ID: ${profileId}`)

    // First, try to find by profile ID
    const { data, error } = await supabase
      .from('academic_profiles')
      .select('*')
      .eq('id', profileId)
      .eq('is_public', true)
      .single()

    if (data) {
      console.log(`✅ Found profile by ID: ${profileId}`)
      return NextResponse.json(data.profile_data)
    }

    // If not found by profile ID, check if it might be a user ID (for backward compatibility)
    console.log(`❌ Profile not found by ID, checking if it's a user ID: ${profileId}`)
    const { data: userProfile, error: userError } = await supabase
      .from('academic_profiles')
      .select('*')
      .eq('user_id', profileId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (userProfile) {
      console.log(`✅ Found profile by user ID: ${profileId}, redirecting to proper profile ID: ${userProfile.id}`)
      // Redirect to the proper profile ID URL
      return NextResponse.redirect(new URL(`/profile/${userProfile.id}`, request.url))
    }

    console.log(`❌ No public profile found for ID or user ID: ${profileId}`)
    console.log(`Database error:`, error)
    console.log(`User profile error:`, userError)

    return NextResponse.json({ 
      error: 'Profile not found',
      details: 'This profile may not exist, may not be public, or may have been deleted.'
    }, { status: 404 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}