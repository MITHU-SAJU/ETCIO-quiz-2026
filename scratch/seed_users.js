import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envContent = fs.readFileSync('.env', 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    env[key.trim()] = value.trim()
  }
})

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseKey = env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedUsers() {
  const { data: events } = await supabase.from('events').select('id').eq('is_active', true).limit(1)
  const eventId = events?.[0]?.id

  const sampleUsers = [
    { name: 'Mithun Saju', company: 'Google', designation: 'Senior Developer', email: 'mithun@example.com', event_id: eventId },
    { name: 'Jayanth T R', company: 'Future Systems', designation: 'Director', email: 'jayanth@example.com', event_id: eventId },
    { name: 'Satya Nadella', company: 'Microsoft', designation: 'CEO', email: 'satya@microsoft.com', event_id: eventId },
    { name: 'Sundar Pichai', company: 'Alphabet', designation: 'CEO', email: 'sundar@google.com', event_id: eventId },
    { name: 'Elon Musk', company: 'Tesla', designation: 'Technoking', email: 'elon@tesla.com', event_id: eventId },
    { name: 'Mark Zuckerberg', company: 'Meta', designation: 'Founder', email: 'mark@meta.com', event_id: eventId }
  ]

  console.log('Upserting sample users...')
  for (const user of sampleUsers) {
    const { error } = await supabase
      .from('users')
      .upsert(user, { onConflict: 'name,company' }) // Note: Requires unique index or constraint if using onConflict, but we'll just insert since it's a script
    if (error) console.error(`Error with ${user.name}:`, error.message)
  }
  console.log('Seeding complete.')
}

seedUsers()
