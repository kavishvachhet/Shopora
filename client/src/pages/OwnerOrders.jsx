import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'

const STATUSES = ['all', 'Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
const NEXT_STATUS = {
  Placed: 'Processing',
  Processing: 'Shipped',
  Shipped: 'Delivered',
}

export default function OwnerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [total, setTotal] = useState(0)

  const load = async (status = filter) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/owner/orders?status=${status}`)
      setOrders(data.orders)
      setTotal(data.total)
    } catch (err) {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.post(`/owner/orders/update-status/${orderId}`, { status: newStatus })
      toast.success(`Order updated to ${newStatus}`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update')
    }
  }

  const badgeClass = (s) => `badge badge-${s.toLowerCase()}`

  const STEPS = ['Placed', 'Processing', 'Shipped', 'Delivered']

  return (
    <div className="owner-layout">
      <aside className="owner-sidebar">
        <h2 className="owner-sidebar-title">Owner Panel</h2>
        <Link to="/owner/dashboard">📊 Dashboard</Link>
        <Link to="/owner/orders" className="active">📦 Orders</Link>
        <Link to="/owner/products">🏷️ Products</Link>
        <Link to="/owner/customers">👥 Customers</Link>
        <Link to="/owner/reviews">⭐ Reviews</Link>
        <Link to="/owner/create">➕ Add New</Link>
        <div style={{ marginTop: 'auto' }}>
          <Link to="/" style={{ color: '#dc2626', fontSize: '.85rem' }}>Logout</Link>
        </div>
      </aside>

      <main className="owner-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            Order Management <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>({total} total)</span>
          </h1>
        </div>

        {/* Status Filter Tabs */}
        <div className="owner-order-tabs">
          {STATUSES.map((s) => (
            <button
              key={s}
              className={`owner-order-tab ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? 'All Orders' : s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loader"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty">
            <h3>No {filter !== 'all' ? filter : ''} orders found</h3>
          </div>
        ) : (
          <div className="owner-orders-list">
            {orders.map((order) => (
              <div key={order._id} className="owner-order-card">
                {/* Header */}
                <div className="owner-order-header">
                  <div>
                    <span className="owner-order-label">Order ID</span>
                    <span className="owner-order-id">#{order._id.slice(-8)}</span>
                  </div>
                  <div>
                    <span className="owner-order-label">Customer</span>
                    <span className="owner-order-customer">{order.userName}</span>
                    <span className="owner-order-email">{order.userEmail}</span>
                  </div>
                  <div>
                    <span className="owner-order-label">Date</span>
                    <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="owner-order-label">Amount</span>
                    <span className="owner-order-amount">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Order Timeline */}
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

                {order.orderStatus === 'Cancelled' && (
                  <div style={{ padding: '1rem 1.5rem', background: '#fef2f2', color: '#b91c1c', fontSize: '.85rem', fontWeight: 600 }}>
                    ❌ This order was cancelled {order.cancelledAt && `on ${new Date(order.cancelledAt).toLocaleDateString()}`}
                  </div>
                )}

                {/* Items */}
                <div className="owner-order-items">
                  {order.items.map((item, i) => (
                    <div key={i} className="owner-order-item">
                      <span className="owner-order-item-name">{item.name}</span>
                      <span className="owner-order-item-meta">×{item.quantity} · ₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                {/* Footer with Actions */}
                <div className="owner-order-footer">
                  <div className="owner-order-footer-info">
                    <span className={badgeClass(order.orderStatus)}>{order.orderStatus}</span>
                    <span style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>{order.paymentMethod} · {order.paymentStatus}</span>
                  </div>
                  <div className="owner-order-actions">
                    {NEXT_STATUS[order.orderStatus] && (
                      <button
                        className="btn btn-accent btn-sm"
                        onClick={() => updateStatus(order._id, NEXT_STATUS[order.orderStatus])}
                      >
                        Mark as {NEXT_STATUS[order.orderStatus]}
                      </button>
                    )}
                    {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => { if (confirm('Cancel this order?')) updateStatus(order._id, 'Cancelled') }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
