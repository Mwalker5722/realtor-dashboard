'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button' // 1. Import the standardized Button component

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    // 2. Use the <Button> component for consistent styling
    <Button
      onClick={handleLogout}
      className="bg-purple-600 hover:bg-purple-700" // We can still apply our custom colors
    >
      Sign Out
    </Button>
  )
}