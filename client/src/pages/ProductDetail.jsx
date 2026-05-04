import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { HiOutlineHeart, HiStar, HiCheckCircle, HiXCircle } from 'react-icons/hi'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const { fetchUser } = useAuth()

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => setProduct(data.product)).catch(() => toast.error('Product not found')).finally(() => setLoading(false))
  }, [id])

  const addToCart = async () => {
    try {
      const { data } = await api.post(`/cart/increase/${id}`)
      if (data.success) { toast.success('Added to cart!'); fetchUser() }
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
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
            {product.image && <img src={`data:image/jpeg;base64,${product.image}`} alt={product.name} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600 }}>{product.name}</h1>
              {product.rating > 0 && <span className="product-rating"><HiStar size={14} /> {product.rating}</span>}
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
              <button className="btn btn-outline" style={{ padding: '.75rem' }}><HiOutlineHeart size={20} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
