import { useState, type FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { AuthCard } from '@/layouts/auth-layout'
import { Button, Input, Label } from '@tasky/ui'
import { Loader2 } from 'lucide-react'

export function LoginPage() {
  const { login } = useAuth()
  const toast = useToast()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error: loginError } = await login(username, password)
    if (loginError) {
      toast.error('Error al iniciar sesión', loginError.message || 'Credenciales incorrectas')
    } else {
      toast.success('Bienvenido', 'Sesión iniciada correctamente')
    }
    setLoading(false)
  }

  return (
    <AuthCard
      title="Bienvenido"
      description="Inicia sesión para acceder a Tasky"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">
            Usuario
          </Label>
          <Input
            id="username"
            type="text"
            placeholder="tu_usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            required
            autoComplete="username"
            autoFocus
            className="h-11 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Contraseña
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            autoComplete="current-password"
            minLength={4}
            className="h-11 text-sm"
          />
        </div>
        <Button
          type="submit"
          className="h-11 w-full text-sm font-medium"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Ingresando...
            </>
          ) : (
            'Iniciar sesión'
          )}
        </Button>
        <div className="text-muted-foreground pt-4 text-center text-sm">
          ¿No tienes cuenta?{' '}
          <Link
            to="/register"
            className="text-primary font-medium transition-colors hover:underline"
          >
            Regístrate
          </Link>
        </div>
      </form>
    </AuthCard>
  )
}
