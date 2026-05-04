import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'

export default function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    api.get(`/owner/products/${id}`).then(({ data }) => setForm(data.product)).catch(() => { toast.error('Not found'); navigate('/owner/products') })
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    const fd = new FormData()
    ;['name','price','discount','description','stock','brand','category','subcategory','bgcolor','panelcolor','textcolor','rating'].forEach(k => fd.append(k, form[k] || ''))
    if (image) fd.append('image', image)
    try {
      const { data } = await api.post(`/owner/products/edit/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      if (data.success) { toast.success('Updated!'); navigate('/owner/products') }
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setLoading(false) }
  }

  if (!form) return <div className="loader"><div className="spinner" /></div>

  return (
    <div className="owner-layout">
      <aside className="owner-sidebar">
        <h2 className="owner-sidebar-title">Owner Panel</h2>
        <Link to="/owner/products">All Products</Link>
        <Link to="/owner/create">+ Add New</Link>
      </aside>
      <main className="owner-main">
        <div style={{ maxWidth: 700 }}>
          <Link to="/owner/products" style={{ fontSize: '.85rem', color: 'var(--text-muted)', display: 'inline-block', marginBottom: '1rem' }}>← All Products</Link>
          <h1 className="page-title">Edit Product</h1>
          <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
            <div className="form-group">
              <label className="form-label">Current Image</label>
              {form.image && <img src={`data:image/jpeg;base64,${form.image}`} alt="Current" style={{ height: 100, borderRadius: 'var(--radius-sm)', marginBottom: '.5rem', border: '1px solid var(--border)' }} />}
              <label className="form-label" style={{ marginTop: '.5rem' }}>Change Image (optional)</label>
              <input type="file" onChange={e => setImage(e.target.files[0])} accept="image/*" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name || ''} onChange={e => set('name', e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">Price</label><input className="form-input" type="number" value={form.price || ''} onChange={e => set('price', e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">Discount (%)</label><input className="form-input" type="number" value={form.discount || ''} onChange={e => set('discount', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Stock</label><input className="form-input" type="number" value={form.stock || ''} onChange={e => set('stock', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Brand</label><input className="form-input" value={form.brand || ''} onChange={e => set('brand', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Category</label><input className="form-input" value={form.category || ''} onChange={e => set('category', e.target.value)} /></div>
            </div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" value={form.description || ''} onChange={e => set('description', e.target.value)} rows={3} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">BG Color</label><input className="form-input" value={form.bgcolor || ''} onChange={e => set('bgcolor', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Panel Color</label><input className="form-input" value={form.panelcolor || ''} onChange={e => set('panelcolor', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Text Color</label><input className="form-input" value={form.textcolor || ''} onChange={e => set('textcolor', e.target.value)} /></div>
            </div>
            <div className="form-group"><label className="form-label">Rating</label><input className="form-input" type="number" step="0.1" min="0" max="5" value={form.rating || ''} onChange={e => set('rating', e.target.value)} /></div>
            <button className="btn btn-accent btn-lg" type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update Product'}</button>
          </form>
        </div>
      </main>
    </div>
  )
}
