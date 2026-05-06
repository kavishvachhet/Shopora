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
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const { fetchUser } = useAuth()

  const load = async (sort = sortby, f = filter, s = search, pageNumber = 1, reset = false) => {
    if (reset) setLoading(true)
    else setLoadingMore(true)
    
    try {
      const url = f === 'discounted' ? `/products/discounted?page=${pageNumber}&limit=12` : `/products?sortby=${sort}&search=${s}&page=${pageNumber}&limit=12`
      const { data } = await api.get(url)
      
      if (reset) {
        setProducts(data.products || [])
      } else {
        setProducts(prev => [...prev, ...(data.products || [])])
      }
      setWishlist((data.wishlist || []).map(w => w.toString()))
      setTotalPages(data.totalPages || 1)
      setTotalProducts(data.totalProducts || 0)
    } catch (err) {
      toast.error('Failed to load products')
    } finally { 
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Effect for Sort and Filter changes
  useEffect(() => { 
    setPage(1)
    load(sortby, filter, search, 1, true) 
  }, [sortby, filter])

  // Debounced Effect for Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      load(sortby, filter, search, 1, true)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

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
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <h4>Search</h4>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search products..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ fontSize: '.85rem', padding: '.6rem .8rem' }}
              />
            </div>
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
                        {p.image && <img src={p.image} alt={p.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />}
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
                {loadingMore && [...Array(4)].map((_, i) => (
                  <div className="skeleton-card" key={i}>
                    <div className="skeleton skeleton-img" />
                    <div className="skeleton skeleton-title" />
                    <div className="skeleton skeleton-price" />
                    <div className="skeleton skeleton-price" style={{ width: '30%' }} />
                  </div>
                ))}
              </div>
            )}

            {!loading && products.length > 0 && (
              <>
                <div className="pagination-info">
                  <p className="progress-text">Showing {products.length} of {totalProducts} products</p>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${(products.length / totalProducts) * 100}%` }}></div>
                  </div>
                </div>

                {page < totalPages && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
                    <button 
                      className="btn btn-primary" 
                      disabled={loadingMore}
                      onClick={() => {
                        const nextPage = page + 1;
                        setPage(nextPage);
                        load(sortby, filter, search, nextPage, false);
                      }}
                    >
                      {loadingMore ? 'Loading...' : 'Load More Products'}
                    </button>
                  </div>
                )}

                {page >= totalPages && products.length > 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '.9rem', fontWeight: 500 }}>
                    ✨ You've reached the end of our collection!
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
