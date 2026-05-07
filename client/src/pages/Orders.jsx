import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import { HiOutlineShoppingBag } from 'react-icons/hi'

const STEPS = ['Placed', 'Processing', 'Shipped', 'Delivered']

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => { try { const { data } = await api.get('/orders'); setOrders(data.orders) } catch {} finally { setLoading(false) } }
  useEffect(() => { load() }, [])

  const cancel = async (id) => {
    if (!confirm('Cancel this order?')) return
    try { await api.post(`/orders/cancel/${id}`); toast.success('Order cancelled'); load() }
    catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  const clearHistory = async () => {
    if (!confirm('Delete all cancelled orders?')) return
    try { const { data } = await api.post('/orders/clear-history'); toast.success(data.message); load() }
    catch { toast.error('Failed') }
  }

  const badgeClass = (s) => `badge badge-${s.toLowerCase()}`
  const hasCancelled = orders.some(o => o.orderStatus === 'Cancelled')

  if (loading) return <div className="loader"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-inner" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 className="page-title" style={{ marginBottom: 0 }}>My Orders</h1>
          <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
            {hasCancelled && <button className="btn btn-danger btn-sm" onClick={clearHistory}>Clear History</button>}
            <Link to="/shop" style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--accent)' }}>Continue Shopping →</Link>
          </div>
        </div>
        {orders.length === 0 ? (
          <div className="empty">
            <div className="empty-icon"><HiOutlineShoppingBag /></div>
            <h3>No orders yet</h3>
            <p>Explore our shop for amazing products!</p>
            <Link to="/shop" className="btn btn-accent">Start Shopping</Link>
          </div>
        ) : orders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <div><p className="order-header-label">Order ID</p><p className="order-header-value" style={{ fontFamily: 'monospace', fontSize: '.75rem' }}>#{order._id.slice(-8)}</p></div>
              <div><p className="order-header-label">Placed On</p><p className="order-header-value">{new Date(order.createdAt).toLocaleDateString()}</p></div>
              <div><p className="order-header-label">Status</p><span className={badgeClass(order.orderStatus)}>{order.orderStatus}</span></div>
              <div style={{ textAlign: 'right' }}><p className="order-header-label">Total</p><p className="order-header-value" style={{ fontWeight: 700, color: 'var(--accent)' }}>₹{order.totalAmount.toLocaleString()}</p></div>
            </div>

            {/* Visual Order Timeline */}
            {order.orderStatus !== 'Cancelled' && (
              <div className="order-timeline">
                {STEPS.map((step, i) => {
                  const currentIdx = STEPS.indexOf(order.orderStatus)
                  const isDone = i <= currentIdx
                  const isCurrent = i === currentIdx
                  return (
                    <div key={step} className={`timeline-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                      <div className="timeline-dot">{isDone ? '✓' : i + 1}</div>
                      <span className="timeline-label">{step}</span>
                      {i < STEPS.length - 1 && <div className={`timeline-line ${i < currentIdx ? 'done' : ''}`} />}
                    </div>
                  )
                })}
              </div>
            )}

            <div className="order-items">
              {order.items.map((item, i) => (
                <div key={i} className="order-item">
                  <div className="order-item-img">{item.image && <img src={item.image} alt={item.name} />}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontWeight: 600, fontSize: '.9rem' }}>{item.name}</h4>
                    <p style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                  </div>
                  <p style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
            {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && (
              <div className="order-footer">
                <p style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>Payment: {order.paymentStatus}</p>
                <button className="btn btn-danger btn-sm" onClick={() => cancel(order._id)}>Cancel Order</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
