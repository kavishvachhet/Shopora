import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { HiOutlineMinus, HiOutlinePlus, HiOutlineTrash, HiOutlineShoppingBag } from 'react-icons/hi'

export default function Cart() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { fetchUser } = useAuth()

  const load = async () => {
    try { const { data } = await api.get('/cart'); setItems(data.items || []) }
    catch { toast.error('Failed to load cart') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const increase = async (id) => { await api.post(`/cart/increase/${id}`); load(); fetchUser() }
  const decrease = async (id) => { await api.post(`/cart/decrease/${id}`); load(); fetchUser() }
  const remove = async (id) => { await api.post(`/cart/remove/${id}`); toast.success('Removed'); load(); fetchUser() }

  if (loading) return <div className="loader"><div className="spinner" /></div>

  const calc = (item) => {
    const dp = item.productId.price - (item.productId.price * (item.productId.discount || 0)) / 100
    return { dp, sub: dp * item.quantity }
  }
  const totalMRP = items.reduce((s, i) => s + i.productId.price * i.quantity, 0)
  const totalDiscount = items.reduce((s, i) => s + (i.productId.price * (i.productId.discount || 0) / 100) * i.quantity, 0)
  const total = totalMRP - totalDiscount

  return (
    <div className="page">
      <div className="page-inner">
        <h1 className="page-title">Your Cart</h1>
        {items.length === 0 ? (
          <div className="empty">
            <div className="empty-icon"><HiOutlineShoppingBag /></div>
            <h3>Your Cart is Empty</h3>
            <p>Looks like you haven't added anything yet.</p>
            <Link to="/shop" className="btn btn-accent">Start Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr .6fr', gap: '2.5rem', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map(item => {
                const { dp, sub } = calc(item)
                return (
                  <div key={item.productId._id} className="card" style={{ display: 'grid', gridTemplateColumns: '120px 1fr', overflow: 'hidden' }}>
                    <div style={{ background: item.productId.bgcolor || 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                      {item.productId.image && <img src={item.productId.image} alt={item.productId.name} style={{ maxHeight: '80px', objectFit: 'contain' }} />}
                    </div>
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ fontWeight: 600, marginBottom: '.25rem' }}>{item.productId.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                          <span className="price">₹{dp.toFixed(0)}</span>
                          {item.productId.discount > 0 && <><span className="price-original">₹{item.productId.price}</span><span className="price-discount">{item.productId.discount}% OFF</span></>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '.75rem' }}>
                        <div className="qty">
                          <button onClick={() => decrease(item.productId._id)}><HiOutlineMinus size={14} /></button>
                          <span>{item.quantity}</span>
                          <button onClick={() => increase(item.productId._id)}><HiOutlinePlus size={14} /></button>
                        </div>
                        <button className="btn-ghost" onClick={() => remove(item.productId._id)} style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.85rem' }}>
                          <HiOutlineTrash size={16} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="summary">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, marginBottom: '1.25rem', paddingBottom: '.75rem', borderBottom: '1px solid var(--border)' }}>Order Summary</h3>
              <div className="summary-row"><span>Total MRP</span><span>₹{totalMRP.toFixed(0)}</span></div>
              <div className="summary-row" style={{ color: 'var(--olive)' }}><span>Discount</span><span>- ₹{totalDiscount.toFixed(0)}</span></div>
              <div className="summary-row"><span>Platform Fee</span><span style={{ color: 'var(--olive)', fontWeight: 600 }}>FREE</span></div>
              <div className="summary-row"><span>Shipping</span><span style={{ color: 'var(--olive)', fontWeight: 600 }}>FREE</span></div>
              <div className="summary-total"><span>Total Payable</span><span style={{ color: 'var(--accent)' }}>₹{total.toFixed(0)}</span></div>
              <Link to="/checkout" className="btn btn-accent btn-full btn-lg" style={{ marginTop: '1.5rem' }}>Secure Checkout</Link>
              <p style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '.75rem' }}>Safe & Secure Payments</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
