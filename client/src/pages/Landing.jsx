import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="nav-logo">Shopora</Link>
          <div className="nav-links">
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn btn-accent">Create Account</Link>
          </div>
        </div>
      </nav>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <span className="hero-tag">✦ Curated Collection</span>
            <h1 className="hero-title">Shop Thoughtfully,<br />Live Beautifully</h1>
            <p className="hero-desc">
              Discover handpicked essentials, premium accessories, and everyday items —
              all curated with care and offered at honest prices.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-accent btn-lg">Start Shopping</Link>
              <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
            </div>
          </div>
          <div className="hero-img">
            <img src="/images/shp.avif" alt="Premium shopping collection" />
          </div>
        </div>
      </section>
      <footer className="footer">© {new Date().getFullYear()} Shopora · All Rights Reserved</footer>
    </>
  )
}
