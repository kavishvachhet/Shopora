import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import { HiStar, HiTrash } from 'react-icons/hi'

export default function OwnerReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchReviews = async () => {
    try {
      const { data } = await api.get('/owner/reviews')
      setReviews(data)
    } catch (err) {
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const deleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) return
    try {
      const { data } = await api.delete(`/owner/reviews/${id}`)
      toast.success(data.message)
      setReviews(prev => prev.filter(r => r._id !== id))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete review')
    }
  }

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
          <Link to="/owner/customers" className="btn btn-outline" style={{ border: 'none', textAlign: 'left', padding: '1rem' }}>👥 Customers</Link>
          <Link to="/owner/reviews" className="btn btn-accent" style={{ textAlign: 'left', padding: '1rem' }}>⭐ Reviews</Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="owner-main" style={{ padding: '2rem' }}>
        <div className="owner-order-header" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              ⭐ Review Moderation
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Manage and moderate customer product reviews.</p>
          </div>
        </div>

        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '1rem', fontWeight: 600, minWidth: '200px' }}>Product</th>
                  <th style={{ padding: '1rem', fontWeight: 600, minWidth: '150px' }}>Customer</th>
                  <th style={{ padding: '1rem', fontWeight: 600, minWidth: '100px' }}>Rating</th>
                  <th style={{ padding: '1rem', fontWeight: 600, width: '40%' }}>Review</th>
                  <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No reviews found.</td>
                  </tr>
                ) : (
                  reviews.map(review => (
                    <tr key={review._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}>
                        {review.product ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--cream)', overflow: 'hidden' }}>
                              {review.product.image && <img src={review.product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                            </div>
                            <Link to={`/product/${review.product._id}`} style={{ fontWeight: 600, color: 'var(--text)', textDecoration: 'none' }} target="_blank">
                              {review.product.name}
                            </Link>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Deleted Product</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {review.user ? (
                          <div>
                            <div style={{ fontWeight: 600 }}>{review.user.fullname}</div>
                            <div style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>{review.user.email}</div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Deleted User</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', color: '#f59e0b' }}>
                          {[...Array(5)].map((_, i) => (
                            <HiStar key={i} size={16} color={i < review.rating ? '#f59e0b' : '#e5e7eb'} />
                          ))}
                        </div>
                        <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '.25rem' }}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text)' }}>
                        <p style={{ margin: 0, fontSize: '.9rem', lineHeight: 1.5, wordBreak: 'break-word' }}>
                          {review.comment}
                        </p>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button 
                          onClick={() => deleteReview(review._id)}
                          className="btn btn-sm" 
                          style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '.5rem' }}
                          title="Delete Review"
                        >
                          <HiTrash size={18} />
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
