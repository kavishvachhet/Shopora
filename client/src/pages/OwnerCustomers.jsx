import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import { HiUsers, HiBan, HiCheckCircle, HiSearch } from 'react-icons/hi'

export default function OwnerCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/owner/customers')
      setCustomers(data)
    } catch (err) {
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const toggleBan = async (id, currentStatus) => {
    const actionText = currentStatus ? "unban" : "ban"
    if (!window.confirm(`Are you sure you want to ${actionText} this user?`)) return
    
    try {
      const { data } = await api.post(`/owner/customers/${id}/toggle-ban`)
      toast.success(data.message)
      // Update local state
      setCustomers(prev => prev.map(c => c._id === id ? { ...c, isBanned: data.isBanned } : c))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update user status')
    }
  }

  const filteredCustomers = customers.filter(c => 
    c.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return <div className="loader"><div className="spinner" /></div>

  return (
    <div className="owner-layout">
      {/* Sidebar */}
      <div className="owner-sidebar">
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '2rem' }}>Shopora Admin</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          <Link to="/owner/dashboard" className="btn btn-outline" style={{ border: 'none', textAlign: 'left', padding: '1rem' }}>📊 Dashboard</Link>
          <Link to="/owner/orders" className="btn btn-outline" style={{ border: 'none', textAlign: 'left', padding: '1rem' }}>📦 Orders</Link>
          <Link to="/owner/products" className="btn btn-outline" style={{ border: 'none', textAlign: 'left', padding: '1rem' }}>🏷️ Products</Link>
          <Link to="/owner/customers" className="btn btn-accent" style={{ textAlign: 'left', padding: '1rem' }}>👥 Customers</Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="owner-main" style={{ padding: '2rem' }}>
        <div className="owner-order-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <HiUsers /> Customers
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Manage users and view their lifetime value.</p>
          </div>
          
          <div style={{ position: 'relative', width: '300px' }}>
            <HiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem', margin: 0 }}
            />
          </div>
        </div>

        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Customer</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Contact</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Total Orders</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Lifetime Spend</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No customers found.</td>
                  </tr>
                ) : (
                  filteredCustomers.map(customer => (
                    <tr key={customer._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, overflow: 'hidden' }}>
                            {customer.image ? <img src={customer.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : customer.fullname?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{customer.fullname}</div>
                            <div style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>Joined {new Date(customer.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '.9rem' }}>
                        <div>{customer.email}</div>
                        {customer.contact && <div>{customer.contact}</div>}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ fontWeight: 600, background: 'var(--surface)', padding: '.25rem .75rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                          {customer.totalOrders}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--olive)' }}>
                        ₹{customer.totalSpend.toFixed(2)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {customer.isBanned ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.25rem', color: '#dc2626', background: '#fee2e2', padding: '.25rem .5rem', borderRadius: '4px', fontSize: '.85rem', fontWeight: 600 }}>
                            <HiBan /> Banned
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.25rem', color: 'var(--olive)', background: '#ecfccb', padding: '.25rem .5rem', borderRadius: '4px', fontSize: '.85rem', fontWeight: 600 }}>
                            <HiCheckCircle /> Active
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button 
                          onClick={() => toggleBan(customer._id, customer.isBanned)}
                          className="btn btn-sm" 
                          style={{ 
                            background: customer.isBanned ? 'var(--bg)' : '#fee2e2', 
                            color: customer.isBanned ? 'var(--text)' : '#dc2626',
                            border: customer.isBanned ? '1px solid var(--border)' : '1px solid #fca5a5'
                          }}
                        >
                          {customer.isBanned ? 'Unban User' : 'Ban User'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
