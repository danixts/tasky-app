import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { LoginPage } from '../login'
import { renderWithProviders } from '@/test/test-utils'

describe('LoginPage', () => {
  it('renders login form', () => {
    renderWithProviders(<LoginPage />, { auth: { isAuthenticated: false } })
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument()
    expect(screen.getByLabelText('Usuario')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('has link to register page', () => {
    renderWithProviders(<LoginPage />, { auth: { isAuthenticated: false } })
    expect(screen.getByText('Regístrate')).toHaveAttribute('href', '/register')
  })

  it('calls login on form submit', async () => {
    const login = vi.fn().mockResolvedValue({ error: null })
    renderWithProviders(<LoginPage />, { auth: { isAuthenticated: false, login } })

    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'daniel' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('daniel', '1234')
    })
  })

  it('shows error toast on failed login', async () => {
    const login = vi.fn().mockResolvedValue({ error: new Error('Credenciales incorrectas') })
    renderWithProviders(<LoginPage />, { auth: { isAuthenticated: false, login } })

    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'bad' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'bad' } })
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al iniciar sesión', expect.objectContaining({ description: 'Credenciales incorrectas' }))
    })
  })
})
