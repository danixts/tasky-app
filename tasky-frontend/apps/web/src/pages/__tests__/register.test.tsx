import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { RegisterPage } from '../register'
import { renderWithProviders } from '@/test/test-utils'

describe('RegisterPage', () => {
  it('renders register form', () => {
    renderWithProviders(<RegisterPage />, { auth: { isAuthenticated: false } })
    expect(screen.getByText('Regístrate para empezar a gestionar tus tareas')).toBeInTheDocument()
    expect(screen.getByLabelText('Usuario')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument()
  })

  it('has link to login page', () => {
    renderWithProviders(<RegisterPage />, { auth: { isAuthenticated: false } })
    expect(screen.getByText('Inicia sesión')).toHaveAttribute('href', '/login')
  })

  it('calls register on form submit', async () => {
    const register = vi.fn().mockResolvedValue({ error: null })
    renderWithProviders(<RegisterPage />, { auth: { isAuthenticated: false, register } })

    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'newuser' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@test.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: '1234' } })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith('newuser', 'new@test.com', '1234')
    })
  })

  it('shows error toast on failed registration', async () => {
    const register = vi.fn().mockResolvedValue({ error: new Error('El usuario ya existe') })
    renderWithProviders(<RegisterPage />, { auth: { isAuthenticated: false, register } })

    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'existing' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'e@test.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: '1234' } })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error al registrar', expect.objectContaining({ description: 'El usuario ya existe' }))
    })
  })
})
