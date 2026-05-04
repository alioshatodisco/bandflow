import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tpdgbuchedvgyefpvddo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwZGdidWNoZWR2Z3llZnB2ZGRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MDY4NjUsImV4cCI6MjA5MzQ4Mjg2NX0.Ne6km23OyIPwPu4w3DSqytSUsnKTIoi_DPcW7SoFEgk'

export const supabase = createClient(supabaseUrl, supabaseKey)
