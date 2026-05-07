import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { HiOutlineHeart, HiHeart, HiStar, HiCheckCircle, HiXCircle } from 'react-icons/hi'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [reviews, setReviews] = useState([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user, fetchUser } = useAuth()

  // Review form state
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const loadData = () => {
    setLoading(true)
    Promise.all([
      api.get(`/products/${id}`),
      api.get(`/products/${id}/related`).catch(() => ({ data: [] })),
      api.get(`/products/${id}/reviews`).catch(() => ({ data: [] })),
      user ? api.get('/wishlist').catch(() => ({ data: { items: [] } })) : Promise.resolve({ data: { items: [] } })
    ])
      .then(([prodRes, relRes, revRes, wishRes]) => {
        setProduct(prodRes.data.product)
        setRelated(relRes.data)
        setReviews(revRes.data)
        if (wishRes.data.items) {
          setIsFavorite(wishRes.data.items.some(item => item._id === id))
        }
      })
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [id])

  const addToCart = async () => {
    try {
      const { data } = await api.post(`/cart/increase/${id}`)
      if (data.success) { toast.success('Added to cart!'); fetchUser() }
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  const toggleWishlist = async () => {
    if (!user) return toast.error('Please log in to add to wishlist')
    try {
      const { data } = await api.post(`/wishlist/toggle/${id}`)
      setIsFavorite(data.action === 'added')
      toast.success(data.message)
    } catch (err) {
      toast.error('Failed to update wishlist')
    }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return toast.error('Please write a comment')
    setSubmittingReview(true)
    try {
      await api.post(`/products/${id}/reviews`, { rating, comment })
      toast.success('Review submitted successfully!')
      setComment('')
      setRating(5)
      loadData() // Refresh product to get updated average rating and reviews list
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) return <div className="loader"><div className="spinner" /></div>
  if (!product) return <div className="page"><div className="empty"><h3>Product not found</h3><Link to="/shop" className="btn btn-accent" style={{ marginTop: '1rem' }}>Back to Shop</Link></div></div>

  const fp = product.discount > 0 ? Math.max(product.price - (product.price * product.discount / 100), 0) : product.price

  return (
    <div className="page">
      <div className="page-inner">
        <Link to="/shop" style={{ fontSize: '.85rem', color: 'var(--text-muted)', display: 'inline-block', marginBottom: '1.5rem' }}>← Back to Shop</Link>
        <div className="product-detail">
          <div className="product-detail-img" style={{ background: product.bgcolor || 'var(--cream)' }}>
            {product.image && <img src={product.image} alt={product.name} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, margin: 0 }}>{product.name}</h1>
              {product.rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexShrink: 0 }}>
                  <span className="product-rating" style={{ whiteSpace: 'nowrap' }}><HiStar size={14} /> {product.rating}</span>
                  <a href="#reviews" style={{ fontSize: '.85rem', color: 'var(--text-muted)', textDecoration: 'underline', whiteSpace: 'nowrap' }}>
                    ({product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'})
                  </a>
                </div>
              )}
            </div>
            <p className="product-meta">{product.brand || 'Brand'} • {product.category || 'Category'}</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '.75rem', margin: '.5rem 0 1rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700 }}>₹{fp.toFixed(0)}</span>
              {product.discount > 0 && <><span className="price-original" style={{ fontSize: '1rem', marginBottom: '.3rem' }}>₹{product.price}</span><span className="price-discount">{product.discount}% OFF</span></>}
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{product.description || 'No description available.'}</p>
            <div style={{ marginBottom: '2rem', fontSize: '.9rem' }}>
              {product.stock > 0
                ? <span style={{ color: 'var(--olive)', display: 'flex', alignItems: 'center', gap: '.3rem' }}><HiCheckCircle size={16} /> In Stock ({product.stock} left)</span>
                : <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '.3rem' }}><HiXCircle size={16} /> Out of Stock</span>}
            </div>
            <div style={{ display: 'flex', gap: '.75rem', marginTop: 'auto' }}>
              {product.stock > 0
                ? <button className="btn btn-accent btn-lg" onClick={addToCart} style={{ flex: 1 }}>Add to Cart</button>
                : <button className="btn btn-lg" disabled style={{ flex: 1, background: '#e5e5e5', color: '#999' }}>Out of Stock</button>}
              <button className="btn btn-outline" onClick={toggleWishlist} style={{ padding: '.75rem', borderColor: isFavorite ? '#ef4444' : '', color: isFavorite ? '#ef4444' : '' }}>
                {isFavorite ? <HiHeart size={20} /> : <HiOutlineHeart size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div id="reviews" className="reviews-section" style={{ marginTop: '4rem', paddingTop: '2.5rem', borderTop: '2px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 className="related-title" style={{ marginBottom: 0 }}>Customer Reviews</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <HiStar size={24} color="#f59e0b" />
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{product.rating > 0 ? product.rating : 'New'}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>({product.numReviews} reviews)</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '3rem' }} className="reviews-layout">
            
            {/* Reviews List */}
            <div className="reviews-list">
              {reviews.length === 0 ? (
                <div className="empty" style={{ padding: '2rem' }}>
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {reviews.map(rev => (
                    <div key={rev._id} style={{ padding: '1.5rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--charcoal)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, overflow: 'hidden' }}>
                            {rev.user?.image ? <img src={rev.user.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : rev.user?.fullname?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '.9rem' }}>{rev.user?.fullname || 'Deleted User'}</p>
                            <p style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{new Date(rev.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', color: '#f59e0b' }}>
                          {[...Array(5)].map((_, i) => (
                            <HiStar key={i} size={16} color={i < rev.rating ? '#f59e0b' : '#e5e7eb'} />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: '.9rem', lineHeight: 1.6, color: 'var(--text)' }}>{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write a Review Form */}
            <div className="review-form-container">
              <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Write a Review</h3>
                {!user ? (
                  <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '.9rem' }}>Please log in to leave a review.</p>
                    <Link to="/login" className="btn btn-accent btn-full">Log In</Link>
                  </div>
                ) : (
                  <form onSubmit={submitReview}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label">Rating</label>
                      <div style={{ display: 'flex', gap: '.25rem' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <HiStar 
                            key={star} 
                            size={28} 
                            color={star <= rating ? '#f59e0b' : '#e5e7eb'} 
                            style={{ cursor: 'pointer', transition: 'color .2s' }}
                            onClick={() => setRating(star)}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Your Review</label>
                      <textarea 
                        className="form-input" 
                        rows="4" 
                        placeholder="What did you like or dislike? What did you use this product for?"
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        style={{ resize: 'vertical' }}
                      />
                    </div>
                    <button type="submit" className="btn btn-accent btn-full" disabled={submittingReview}>
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                    <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
                      You can only review products you have purchased.
                    </p>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="related-section">
            <h2 className="related-title">You Might Also Like</h2>
            <div className="related-grid">
              {related.map((p) => {
                const rfp = p.discount > 0 ? Math.max(p.price - (p.price * p.discount / 100), 0) : p.price
                return (
                  <Link key={p._id} to={`/product/${p._id}`} className="card related-card">
                    <div className="card-img-wrap">
                      {p.image && <img src={p.image} alt={p.name} className="card-img" />}
                    </div>
                    <div className="card-body">
                      <h4 className="related-name">{p.name}</h4>
                      <p style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{p.category} · {p.brand}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginTop: '.5rem' }}>
                        <span className="price">₹{rfp.toFixed(0)}</span>
                        {p.discount > 0 && <span className="price-discount">{p.discount}% OFF</span>}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
