import { useState, type FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { AuthCard } from '@/layouts/auth-layout'
import { Button, Input, Label } from '@tasky/ui'
import { Loader2 } from 'lucide-react'

export function RegisterPage() {
  const { register } = useAuth()
  const toast = useToast()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordsMatch = password === confirmPassword || !confirmPassword
  const canSubmit =
    username &&
    email &&
    password.length >= 4 &&
    confirmPassword.length >= 4 &&
    passwordsMatch

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.warning('Contraseñas no coinciden', 'Verifica que ambas contraseñas sean iguales')
      return
    }
    setLoading(true)

    const { error: regError } = await register(username, email, password)
    if (regError) {
      toast.error('Error al registrar', regError.message || 'No se pudo crear la cuenta')
    } else {
      toast.success('Cuenta creada', '¡Bienvenido a Tasky!')
    }
    setLoading(false)
  }

  return (
    <AuthCard
      title="Crear cuenta"
      description="Regístrate para empezar a gestionar tus tareas"
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
            minLength={3}
            maxLength={50}
            autoFocus
            className="h-11 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
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
            placeholder="Mínimo 4 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            minLength={4}
            className="h-11 text-sm"
          />
          {password && password.length < 4 && (
            <p className="text-muted-foreground text-xs">
              La contraseña debe tener al menos 4 caracteres
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirmar contraseña
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
            minLength={4}
            className="h-11 text-sm"
          />
          {confirmPassword && !passwordsMatch && (
            <p className="text-destructive text-xs">Las contraseñas no coinciden</p>
          )}
        </div>
        <Button
          type="submit"
          className="h-11 w-full text-sm font-medium transition-all"
          disabled={loading || !canSubmit}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            'Crear cuenta'
          )}
        </Button>
        <div className="text-muted-foreground pt-4 text-center text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="text-primary font-medium transition-colors hover:underline"
          >
            Inicia sesión
          </Link>
        </div>
      </form>
    </AuthCard>
  )
}
