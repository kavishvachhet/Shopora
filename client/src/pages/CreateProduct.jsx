import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'

export default function CreateProduct() {
  const [form, setForm] = useState({ name: '', price: '', discount: '', description: '', stock: '', brand: '', category: '', subcategory: '', bgcolor: '', panelcolor: '', textcolor: '', rating: '' })
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (image) fd.append('image', image)
    try {
      const { data } = await api.post('/owner/products/create', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      if (data.success) { toast.success('Product created!'); navigate('/owner/products') }
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="owner-layout">
      <aside className="owner-sidebar">
        <h2 className="owner-sidebar-title">Owner Panel</h2>
        <Link to="/owner/products" className="active">All Products</Link>
        <div style={{ marginTop: 'auto' }}><Link to="/" style={{ color: '#dc2626', fontSize: '.85rem' }}>Logout</Link></div>
      </aside>
      <main className="owner-main">
        <div style={{ maxWidth: 700 }}>
          <h1 className="page-title">Create New Product</h1>
          <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '1rem', paddingBottom: '.5rem', borderBottom: '1px solid var(--border)' }}>Product Details</h3>
            <div className="form-group"><label className="form-label">Product Image</label><input type="file" onChange={e => setImage(e.target.files[0])} accept="image/*" required /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><input className="form-input" placeholder="Product Name" value={form.name} onChange={e => set('name', e.target.value)} required /></div>
              <div className="form-group"><input className="form-input" type="number" placeholder="Price" value={form.price} onChange={e => set('price', e.target.value)} required /></div>
              <div className="form-group"><input className="form-input" type="number" placeholder="Discount (%)" value={form.discount} onChange={e => set('discount', e.target.value)} /></div>
              <div className="form-group"><input className="form-input" type="number" placeholder="Stock" value={form.stock} onChange={e => set('stock', e.target.value)} /></div>
            </div>
            <div className="form-group"><textarea className="form-input" placeholder="Description" value={form.description} onChange={e => set('description', e.target.value)} rows={3} /></div>

            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent)', margin: '1.5rem 0 1rem', paddingBottom: '.5rem', borderBottom: '1px solid var(--border)' }}>Category & Brand</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><input className="form-input" placeholder="Brand" value={form.brand} onChange={e => set('brand', e.target.value)} /></div>
              <div className="form-group"><input className="form-input" placeholder="Category" value={form.category} onChange={e => set('category', e.target.value)} /></div>
              <div className="form-group"><input className="form-input" placeholder="Subcategory" value={form.subcategory} onChange={e => set('subcategory', e.target.value)} /></div>
              <div className="form-group"><input className="form-input" type="number" step="0.1" min="0" max="5" placeholder="Rating (0-5)" value={form.rating} onChange={e => set('rating', e.target.value)} /></div>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent)', margin: '1.5rem 0 1rem', paddingBottom: '.5rem', borderBottom: '1px solid var(--border)' }}>Panel Colors</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><input className="form-input" placeholder="Background Color" value={form.bgcolor} onChange={e => set('bgcolor', e.target.value)} /></div>
              <div className="form-group"><input className="form-input" placeholder="Panel Color" value={form.panelcolor} onChange={e => set('panelcolor', e.target.value)} /></div>
              <div className="form-group"><input className="form-input" placeholder="Text Color" value={form.textcolor} onChange={e => set('textcolor', e.target.value)} /></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn-accent btn-lg" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Product'}</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
