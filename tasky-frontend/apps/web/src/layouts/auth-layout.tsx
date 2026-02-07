import { Card, CardContent, CardDescription, CardHeader, CardTitle, ShineBorder } from '@tasky/ui'
import { LayoutDashboard } from 'lucide-react'

interface AuthCardProps {
  title: string
  description: string
  children: React.ReactNode
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <Card className="relative w-full max-w-md overflow-hidden shadow-xl">
      <ShineBorder shineColor="#0d47a1" borderWidth={1.5} duration={14} />
      <CardHeader className="space-y-1 pt-6 pb-4 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <LayoutDashboard className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-6 pb-6">{children}</CardContent>
    </Card>
  )
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div
        className="fixed inset-0 -z-10 opacity-40"
        style={{
          background:
            'radial-gradient(circle at 20% 15%, rgba(13, 71, 161, 0.08), transparent 70%), radial-gradient(circle at 80% 10%, rgba(13, 71, 161, 0.06), transparent 75%)',
        }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-gray-50 to-gray-100" />
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
