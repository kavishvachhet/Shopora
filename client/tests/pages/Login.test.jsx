import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Login from '../../src/pages/Login'

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock AuthContext
const mockLogin = vi.fn()
vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    loading: false
  })
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
}

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the login form', () => {
    renderLogin()
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to continue your journey.')).toBeInTheDocument()
  })

  it('should render email and password inputs', () => {
    renderLogin()
    
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
  })

  it('should render the Sign In button', () => {
    renderLogin()
    
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('should render Forgot Password link', () => {
    renderLogin()
    
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument()
  })

  it('should render link to Register page', () => {
    renderLogin()
    
    expect(screen.getByText('Create one')).toBeInTheDocument()
  })

  it('should render the Shopora logo linking to home', () => {
    renderLogin()
    
    expect(screen.getByText('Shopora')).toBeInTheDocument()
  })

  it('should have password field as type password by default', () => {
    renderLogin()
    
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    expect(passwordInput.type).toBe('password')
  })

  it('should allow typing in email and password fields', async () => {
    const user = userEvent.setup()
    renderLogin()
    
    const emailInput = screen.getByPlaceholderText('you@example.com')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'mypassword')
    
    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('mypassword')
  })

  it('should call login function on form submit', async () => {
    mockLogin.mockResolvedValue({ success: true })
    const user = userEvent.setup()
    renderLogin()
    
    const emailInput = screen.getByPlaceholderText('you@example.com')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'mypassword')
    await user.click(screen.getByText('Sign In'))
    
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'mypassword')
  })

  it('should show "Signing in..." while loading', async () => {
    // Make login hang so we can check the loading state
    mockLogin.mockImplementation(() => new Promise(() => {}))
    const user = userEvent.setup()
    renderLogin()
    
    const emailInput = screen.getByPlaceholderText('you@example.com')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'mypassword')
    await user.click(screen.getByText('Sign In'))
    
    expect(screen.getByText('Signing in...')).toBeInTheDocument()
  })
})
