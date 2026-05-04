import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HiOutlineShoppingBag, HiOutlineClipboardList, HiOutlineUser } from 'react-icons/hi'

export default function Navbar() {
  const { user, cartCount, logout } = useAuth()

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/shop" className="nav-logo">Shopora</Link>
        <div className="nav-links">
          <Link to="/shop" className="nav-link">Shop</Link>
          {user && (
            <>
              <Link to="/cart" className="nav-link nav-link-icon">
                <HiOutlineShoppingBag size={18} />
                <span>Cart</span>
                {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
              </Link>
              <Link to="/orders" className="nav-link nav-link-icon">
                <HiOutlineClipboardList size={18} />
                <span>Orders</span>
              </Link>
              <Link to="/account" className="nav-link nav-link-icon">
                <HiOutlineUser size={18} />
                <span>Account</span>
              </Link>
              <button className="btn btn-outline btn-sm" onClick={async () => { await logout(); window.location.href = '/' }}>
                Logout
              </button>
            </>
          )}
          {!user && <Link to="/login" className="btn btn-primary btn-sm">Login</Link>}
        </div>
      </div>
    </nav>
  )
}
