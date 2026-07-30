import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Shop from '../../src/pages/Shop'

// Mock api
vi.mock('../../src/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        products: [
          { _id: '1', name: 'Test Shoe', price: 2999, discount: 10, rating: 4.5, image: null, stock: 5 },
          { _id: '2', name: 'Test Jacket', price: 4999, discount: 0, rating: 3.8, image: null, stock: 12 }
        ],
        wishlist: [],
        currentPage: 1,
        totalPages: 1,
        totalProducts: 2
      }
    }),
    post: vi.fn().mockResolvedValue({ data: { success: true } })
  }
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock AuthContext
vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: { fullname: 'Test User', email: 'test@test.com' },
    fetchUser: vi.fn(),
    cartCount: 0,
    loading: false
  })
}))

function renderShop() {
  return render(
    <MemoryRouter>
      <Shop />
    </MemoryRouter>
  )
}

describe('Shop Page', () => {
  it('should render the page', async () => {
    renderShop()
    
    // The component should render — initially might show skeletons
    // Wait for products to appear
    const productName = await screen.findByText('Test Shoe', {}, { timeout: 3000 })
    expect(productName).toBeInTheDocument()
  })

  it('should display product cards after data loads', async () => {
    renderShop()
    
    const shoe = await screen.findByText('Test Shoe', {}, { timeout: 3000 })
    const jacket = await screen.findByText('Test Jacket', {}, { timeout: 3000 })
    
    expect(shoe).toBeInTheDocument()
    expect(jacket).toBeInTheDocument()
  })

  it('should display product prices', async () => {
    renderShop()
    
    // Wait for component to load
    await screen.findByText('Test Shoe', {}, { timeout: 3000 })
    
    // Prices should be displayed somewhere
    expect(screen.getByText(/2999|₹2,999|₹2999/)).toBeInTheDocument()
  })

  it('should render sort/filter controls', async () => {
    renderShop()
    
    // Wait for render
    await screen.findByText('Test Shoe', {}, { timeout: 3000 })
    
    // There should be some sort of filter/sort UI element
    const selects = document.querySelectorAll('select')
    expect(selects.length).toBeGreaterThanOrEqual(1)
  })
})
