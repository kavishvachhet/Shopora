import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Wishlist from './pages/Wishlist'
import MyAccount from './pages/MyAccount'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import OwnerLogin from './pages/OwnerLogin'
import CreateProduct from './pages/CreateProduct'
import OwnerProducts from './pages/OwnerProducts'
import EditProduct from './pages/EditProduct'
import OwnerDashboard from './pages/OwnerDashboard'
import OwnerOrders from './pages/OwnerOrders'
import OwnerCustomers from './pages/OwnerCustomers'
import OwnerReviews from './pages/OwnerReviews'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loader"><div className="spinner" /></div>
  return user ? children : <Navigate to="/login" />
}

function UserPage({ children }) {
  return <><Navbar />{children}<Footer /></>
}

export default function App() {
  const { user, loading } = useAuth()

  return (
    <>
      <Routes>
        {/* Public (no navbar) */}
        <Route path="/" element={!loading && user ? <Navigate to="/shop" /> : <Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/owner/login" element={<OwnerLogin />} />

        {/* Protected (with navbar + footer) */}
        <Route path="/shop" element={<ProtectedRoute><UserPage><Shop /></UserPage></ProtectedRoute>} />
        <Route path="/product/:id" element={<ProtectedRoute><UserPage><ProductDetail /></UserPage></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><UserPage><Cart /></UserPage></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><UserPage><Checkout /></UserPage></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><UserPage><Orders /></UserPage></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><UserPage><Wishlist /></UserPage></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><UserPage><MyAccount /></UserPage></ProtectedRoute>} />

        {/* Owner */}
        <Route path="/owner/dashboard" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
        <Route path="/owner/orders" element={<ProtectedRoute><OwnerOrders /></ProtectedRoute>} />
        <Route path="/owner/create" element={<ProtectedRoute><CreateProduct /></ProtectedRoute>} />
        <Route path="/owner/products" element={<ProtectedRoute><OwnerProducts /></ProtectedRoute>} />
        <Route path="/owner/products/edit/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
        <Route path="/owner/customers" element={<ProtectedRoute><OwnerCustomers /></ProtectedRoute>} />
        <Route path="/owner/reviews" element={<ProtectedRoute><OwnerReviews /></ProtectedRoute>} />
      </Routes>
    </>
  )
}
