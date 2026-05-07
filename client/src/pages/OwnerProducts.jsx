import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'

export default function OwnerProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => { try { const { data } = await api.get('/owner/products'); setProducts(data.products) } catch {} finally { setLoading(false) } }
  useEffect(() => { load() }, [])

  const del = async (id) => {
    if (!confirm('Delete this product?')) return
    try { await api.post(`/owner/products/delete/${id}`); toast.success('Deleted'); load() }
    catch { toast.error('Failed') }
  }

  if (loading) return <div className="loader"><div className="spinner" /></div>

  return (
    <div className="owner-layout">
      <aside className="owner-sidebar">
        <h2 className="owner-sidebar-title">Owner Panel</h2>
        <Link to="/owner/dashboard">📊 Dashboard</Link>
        <Link to="/owner/orders">📦 Orders</Link>
        <Link to="/owner/products" className="active">🏷️ Products</Link>
        <Link to="/owner/customers">👥 Customers</Link>
        <Link to="/owner/reviews">⭐ Reviews</Link>
        <Link to="/owner/create">➕ Add New</Link>
        <div style={{ marginTop: 'auto' }}><Link to="/" style={{ color: '#dc2626', fontSize: '.85rem' }}>Logout</Link></div>
      </aside>
      <main className="owner-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Your Products</h1>
          <Link to="/owner/create" className="btn btn-accent">+ Add New Product</Link>
        </div>
        {products.length === 0 ? (
          <div className="empty"><h3>No Products Found</h3><Link to="/owner/create" className="btn btn-accent" style={{ marginTop: '1rem' }}>Add a Product</Link></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.5rem' }}>
            {products.map(p => {
              const fp = p.discount > 0 ? Math.max(p.price - (p.price * p.discount / 100), 0) : p.price
              return (
                <div key={p._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                    {p.image && <img src={p.image} alt={p.name} style={{ maxHeight: '100%', objectFit: 'contain', padding: '1rem' }} />}
                  </div>
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontWeight: 600, marginBottom: '.25rem' }}>{p.name}</h3>
                    <p style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>{p.category || 'N/A'} · {p.brand || 'N/A'}</p>
                    <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', marginBottom: '.5rem' }}>Stock: {p.stock}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
                      {p.discount > 0 ? (
                        <><span className="price-original">₹{p.price}</span><span className="price" style={{ color: 'var(--olive)' }}>₹{fp.toFixed(0)}</span><span className="price-discount">{p.discount}% OFF</span></>
                      ) : <span className="price">₹{p.price}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '.5rem', marginTop: 'auto' }}>
                      <Link to={`/owner/products/edit/${p._id}`} className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Edit</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => del(p._id)} style={{ flex: 1 }}>Delete</button>
                    </div>
                    <p style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginTop: '.5rem' }}>Created: {new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
