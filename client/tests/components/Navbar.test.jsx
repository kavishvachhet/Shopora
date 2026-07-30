import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Navbar from '../../src/components/Navbar'

// Mock the AuthContext
const mockAuth = {
  user: null,
  cartCount: 0,
  loading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  fetchUser: vi.fn(),
  setCartCount: vi.fn()
}

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => mockAuth
}))

function renderNavbar(authOverrides = {}) {
  Object.assign(mockAuth, authOverrides)
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  )
}

describe('Navbar Component', () => {
  it('should render the Shopora logo', () => {
    renderNavbar()
    expect(screen.getByText('Shopora')).toBeInTheDocument()
  })

  it('should render Shop link', () => {
    renderNavbar()
    const shopLinks = screen.getAllByText('Shop')
    expect(shopLinks.length).toBeGreaterThanOrEqual(1)
  })

  it('should show Login button when user is not logged in', () => {
    renderNavbar({ user: null })
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('should show Cart, Orders, Account links when user is logged in', () => {
    renderNavbar({
      user: { fullname: 'John Doe', email: 'john@test.com' }
    })

    expect(screen.getByText('Cart')).toBeInTheDocument()
    expect(screen.getByText('Orders')).toBeInTheDocument()
    expect(screen.getByText('Account')).toBeInTheDocument()
  })

  it('should show Logout button when user is logged in', () => {
    renderNavbar({
      user: { fullname: 'John', email: 'john@test.com' }
    })

    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('should show cart count badge when cartCount > 0', () => {
    renderNavbar({
      user: { fullname: 'John', email: 'john@test.com' },
      cartCount: 3
    })

    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should NOT show cart badge when cartCount is 0', () => {
    const { container } = renderNavbar({
      user: { fullname: 'John', email: 'john@test.com' },
      cartCount: 0
    })

    expect(container.querySelector('.nav-badge')).toBeNull()
  })

  it('should NOT show Cart/Orders/Account when user is null', () => {
    renderNavbar({ user: null })

    expect(screen.queryByText('Cart')).toBeNull()
    expect(screen.queryByText('Orders')).toBeNull()
    expect(screen.queryByText('Account')).toBeNull()
  })
})
