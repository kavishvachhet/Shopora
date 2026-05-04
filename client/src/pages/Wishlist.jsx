import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import { HiOutlineHeart } from 'react-icons/hi'

export default function Wishlist() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => { try { const { data } = await api.get('/wishlist'); setItems(data.items) } catch {} finally { setLoading(false) } }
  useEffect(() => { load() }, [])

  const remove = async (id) => { await api.post(`/wishlist/remove/${id}`); toast.success('Removed'); load() }
  const addToCart = async (id) => {
    try { await api.post(`/cart/add/${id}`); toast.success('Added to cart!') }
    catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  if (loading) return <div className="loader"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-inner">
        <h1 className="page-title">Your Wishlist</h1>
        {items.length === 0 ? (
          <div className="empty">
            <div className="empty-icon"><HiOutlineHeart /></div>
            <h3>Your wishlist is empty</h3>
            <p>Save items you love for later.</p>
            <Link to="/shop" className="btn btn-accent">Continue Shopping</Link>
          </div>
        ) : (
          <div className="product-grid">
            {items.map(p => (
              <div key={p._id} className="card">
                <div style={{ background: p.bgcolor || 'var(--cream)', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                  {p.image && <img src={`data:image/jpeg;base64,${p.image}`} alt={p.name} style={{ maxHeight: '100%', objectFit: 'contain' }} />}
                </div>
                <div className="card-body">
                  <h3 style={{ fontWeight: 600, marginBottom: '.25rem' }}>{p.name}</h3>
                  <p className="price">₹{p.price}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '.75rem' }}>
                    <button className="btn-ghost" onClick={() => remove(p._id)} style={{ color: 'var(--accent)', fontSize: '.85rem' }}>♥ Remove</button>
                    <button className="btn btn-primary btn-sm" onClick={() => addToCart(p._id)}>Add to Cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
