import { Link, useMatch } from '@tanstack/react-router'
import { useAuth } from '@/contexts/auth-context'
import { Button, Avatar, AvatarFallback } from '@tasky/ui'
import { LayoutDashboard, BarChart3, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@tasky/ui'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { username, logout } = useAuth()

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name.slice(0, 2).toUpperCase()
  }

  const isBoardActive = useMatch({ from: '/' })
  const isChartsActive = useMatch({ from: '/charts' })

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="flex h-14 items-center px-4 md:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline">Tasky</span>
          </div>

          <nav className="ml-6 flex items-center gap-1">
            <Link to="/">
              <Button variant={isBoardActive ? 'secondary' : 'ghost'} size="sm" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Board</span>
              </Button>
            </Link>
            <Link to="/charts">
              <Button variant={isChartsActive ? 'secondary' : 'ghost'} size="sm" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Graficos</span>
              </Button>
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                      {getInitials(username)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{username}</p>
                    <p className="text-xs leading-none text-muted-foreground">Usuario activo</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
