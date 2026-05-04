import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { HiOutlineHeart, HiHeart, HiOutlinePlus } from 'react-icons/hi'

export default function Shop() {
  const [products, setProducts] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [sortby, setSortby] = useState('newest')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const { fetchUser } = useAuth()

  const load = async (sort = sortby, f = filter) => {
    setLoading(true)
    try {
      const url = f === 'discounted' ? '/products/discounted' : `/products?sortby=${sort}`
      const { data } = await api.get(url)
      setProducts(data.products)
      setWishlist(data.wishlist.map(w => w.toString()))
    } catch (err) {
      toast.error('Failed to load products')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [sortby, filter])

  const toggleWishlist = async (id) => {
    try {
      const { data } = await api.post(`/wishlist/toggle/${id}`)
      toast.success(data.message)
      setWishlist(prev => data.action === 'added' ? [...prev, id] : prev.filter(w => w !== id))
    } catch { toast.error('Failed') }
  }

  const addToCart = async (id) => {
    try {
      const { data } = await api.post(`/cart/add/${id}`)
      toast.success(data.message)
      fetchUser()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  const finalPrice = (p) => p.discount > 0 ? Math.max(p.price - (p.price * p.discount / 100), 0) : p.price

  return (
    <div className="page">
      <div className="page-inner">
        <div className="shop-layout">
          <aside className="sidebar">
            <h4>Sort By</h4>
            <select value={sortby} onChange={e => setSortby(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <h4>Browse</h4>
            <a className={`sidebar-link ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')} style={{ cursor: 'pointer' }}>All Products</a>
            <a className={`sidebar-link ${filter === 'discounted' ? 'active' : ''}`} onClick={() => setFilter('discounted')} style={{ cursor: 'pointer' }}>Discounted</a>
          </aside>

          <main>
            <h1 className="page-title">{filter === 'discounted' ? 'Discounted Products' : 'All Products'}</h1>
            {loading ? (
              <div className="loader"><div className="spinner" /></div>
            ) : products.length === 0 ? (
              <div className="empty"><h3>No products found</h3><p>Check back soon for new arrivals.</p></div>
            ) : (
              <div className="product-grid">
                {products.map(p => (
                  <div className="card" key={p._id}>
                    <Link to={`/product/${p._id}`}>
                      <div style={{ background: p.bgcolor || '#f5f0e8', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                        {p.image && <img src={`data:image/jpeg;base64,${p.image}`} alt={p.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />}
                      </div>
                    </Link>
                    <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link to={`/product/${p._id}`}><h3 style={{ fontSize: '.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</h3></Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginTop: '.3rem', flexWrap: 'wrap' }}>
                          <span className="price" style={{ fontSize: '.95rem' }}>₹{finalPrice(p).toFixed(0)}</span>
                          {p.discount > 0 && <><span className="price-original">₹{p.price}</span><span className="price-discount">{p.discount}% OFF</span></>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '.3rem', flexShrink: 0, marginLeft: '.5rem' }}>
                        <button className="btn-ghost" onClick={() => toggleWishlist(p._id)} title="Wishlist" style={{ padding: '.3rem' }}>
                          {wishlist.includes(p._id) ? <HiHeart size={18} color="var(--accent)" /> : <HiOutlineHeart size={18} />}
                        </button>
                        <button className="btn-ghost" onClick={() => addToCart(p._id)} title="Add to Cart" style={{ padding: '.3rem' }}>
                          <HiOutlinePlus size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
