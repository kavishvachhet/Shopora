import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h3 className="footer-logo">Shopora</h3>
          <p className="footer-tagline">Premium shopping, redefined.</p>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/shop">All Products</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/cart">Cart</Link>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/account">My Account</Link>
            <Link to="/orders">My Orders</Link>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="https://github.com/kavishvachhet/Shopora" target="_blank" rel="noreferrer">GitHub</a>
            <a href="mailto:kavishvachheta11@gmail.com">Contact</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Shopora. Built with ❤️ by Kavish Vachheta.</p>
      </div>
    </footer>
  )
}
