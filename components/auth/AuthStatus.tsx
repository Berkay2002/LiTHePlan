'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function AuthStatus() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        Loading...
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-white text-sm">
        <span className="hidden sm:inline font-medium">
          Hi, {user.username || user.email?.split('@')[0] || `User ${user.sub.slice(0, 8)}`}!
        </span>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleSignOut}
        className="h-10 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
      >
        <LogOut className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Sign Out</span>
      </Button>
    </div>
  )
}