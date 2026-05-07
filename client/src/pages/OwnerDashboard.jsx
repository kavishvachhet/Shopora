import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'

const COLORS = ['#c45d3e', '#5a6e4b', '#2d2d3a', '#92400e', '#4338ca']

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function OwnerDashboard() {
  const [summary, setSummary] = useState(null)
  const [revenue, setRevenue] = useState([])
  const [topSellers, setTopSellers] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sumRes, revRes, topRes, recRes, lowRes] = await Promise.all([
          api.get('/owner/analytics/summary'),
          api.get('/owner/analytics/revenue'),
          api.get('/owner/analytics/top-sellers'),
          api.get('/owner/analytics/recent-orders'),
          api.get('/owner/analytics/low-stock'),
        ])
        setSummary(sumRes.data)
        setRevenue(revRes.data)
        setTopSellers(topRes.data)
        setRecentOrders(recRes.data)
        setLowStock(lowRes.data)
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) return <div className="loader"><div className="spinner" /></div>

  const totalRevStr = summary ? `₹${summary.totalRevenue.toLocaleString('en-IN')}` : '₹0'

  return (
    <div className="owner-layout">
      <aside className="owner-sidebar">
        <h2 className="owner-sidebar-title">Owner Panel</h2>
        <Link to="/owner/dashboard" className="active">📊 Dashboard</Link>
        <Link to="/owner/orders">📦 Orders</Link>
        <Link to="/owner/products">🏷️ Products</Link>
        <Link to="/owner/customers">👥 Customers</Link>
        <Link to="/owner/reviews">⭐ Reviews</Link>
        <Link to="/owner/create">➕ Add New</Link>
        <div style={{ marginTop: 'auto' }}>
          <Link to="/" style={{ color: '#dc2626', fontSize: '.85rem' }}>Logout</Link>
        </div>
      </aside>

      <main className="owner-main">
        <h1 className="page-title" style={{ marginBottom: '2rem' }}>Analytics Dashboard</h1>

        {/* ===== KPI SUMMARY CARDS ===== */}
        <div className="dash-kpi-grid">
          <div className="dash-kpi-card dash-kpi-revenue">
            <span className="dash-kpi-label">Total Revenue</span>
            <span className="dash-kpi-value">{totalRevStr}</span>
            <span className="dash-kpi-icon">💰</span>
          </div>
          <div className="dash-kpi-card dash-kpi-orders">
            <span className="dash-kpi-label">Total Orders</span>
            <span className="dash-kpi-value">{summary?.totalOrders || 0}</span>
            <span className="dash-kpi-icon">📦</span>
          </div>
          <div className="dash-kpi-card dash-kpi-products">
            <span className="dash-kpi-label">Products</span>
            <span className="dash-kpi-value">{summary?.totalProducts || 0}</span>
            <span className="dash-kpi-icon">🏷️</span>
          </div>
          <div className="dash-kpi-card dash-kpi-users">
            <span className="dash-kpi-label">Customers</span>
            <span className="dash-kpi-value">{summary?.totalUsers || 0}</span>
            <span className="dash-kpi-icon">👥</span>
          </div>
        </div>

        {/* ===== REVENUE CHART ===== */}
        <div className="dash-chart-card">
          <h3 className="dash-section-title">Revenue (Last 30 Days)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={revenue} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c45d3e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c45d3e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e4de" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e8e4de',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,.08)',
                    fontSize: '.85rem'
                  }}
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#c45d3e"
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dash-two-col">
          {/* ===== TOP SELLERS ===== */}
          <div className="dash-chart-card">
            <h3 className="dash-section-title">Top Selling Products</h3>
            {topSellers.length === 0 ? (
              <p className="dash-empty-text">No sales data yet. Once orders come in, your top sellers will appear here.</p>
            ) : (
              <>
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer>
                    <BarChart data={topSellers} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8e4de" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} interval={0} angle={-15} textAnchor="end" height={50} />
                      <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                      <Tooltip
                        contentStyle={{
                          background: '#fff',
                          border: '1px solid #e8e4de',
                          borderRadius: '8px',
                          fontSize: '.85rem'
                        }}
                        formatter={(value) => [value, 'Units Sold']}
                      />
                      <Bar dataKey="totalSold" radius={[6, 6, 0, 0]} animationDuration={1200}>
                        {topSellers.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="dash-top-list">
                  {topSellers.map((p, i) => (
                    <div key={p._id} className="dash-top-item">
                      <span className="dash-top-rank">#{i + 1}</span>
                      {p.image && <img src={p.image} alt={p.name} className="dash-top-img" />}
                      <div className="dash-top-info">
                        <span className="dash-top-name">{p.name}</span>
                        <span className="dash-top-meta">{p.totalSold} sold · ₹{p.totalRevenue.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ===== LOW STOCK ALERTS ===== */}
          <div className="dash-chart-card">
            <h3 className="dash-section-title">
              ⚠️ Inventory Warnings
              {lowStock.length > 0 && <span className="dash-alert-badge">{lowStock.length}</span>}
            </h3>
            {lowStock.length === 0 ? (
              <div className="dash-success-box">
                <span style={{ fontSize: '2rem' }}>✅</span>
                <p>All products are well-stocked!</p>
              </div>
            ) : (
              <div className="dash-low-stock-list">
                {lowStock.map((p) => (
                  <div key={p._id} className="dash-low-item">
                    {p.image && <img src={p.image} alt={p.name} className="dash-low-img" />}
                    <div className="dash-low-info">
                      <span className="dash-low-name">{p.name}</span>
                      <span className="dash-low-cat">{p.category} · ₹{p.price}</span>
                    </div>
                    <span className={`dash-stock-badge ${p.stock === 0 ? 'out' : 'low'}`}>
                      {p.stock === 0 ? 'OUT OF STOCK' : `${p.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== RECENT ACTIVITY FEED ===== */}
        <div className="dash-chart-card">
          <h3 className="dash-section-title">Recent Activity</h3>
          {recentOrders.length === 0 ? (
            <p className="dash-empty-text">No recent orders yet.</p>
          ) : (
            <div className="dash-activity-list">
              {recentOrders.map((order) => (
                <div key={order._id} className="dash-activity-item">
                  <div className="dash-activity-avatar">
                    {order.userName ? order.userName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="dash-activity-content">
                    <p className="dash-activity-text">
                      <strong>{order.userName}</strong> placed an order for{' '}
                      <strong>₹{order.totalAmount.toLocaleString('en-IN')}</strong>
                    </p>
                    <p className="dash-activity-meta">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''} ·{' '}
                      {order.paymentMethod} ·{' '}
                      <span className={`badge badge-${order.orderStatus.toLowerCase()}`}>
                        {order.orderStatus}
                      </span>
                    </p>
                  </div>
                  <span className="dash-activity-time">{timeAgo(order.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
