import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loader"><div className="spinner" /></div>
  return user ? children : <Navigate to="/login" />
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

        {/* Protected (with navbar) */}
        <Route path="/shop" element={<ProtectedRoute><><Navbar /><Shop /></></ProtectedRoute>} />
        <Route path="/product/:id" element={<ProtectedRoute><><Navbar /><ProductDetail /></></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><><Navbar /><Cart /></></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><><Navbar /><Checkout /></></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><><Navbar /><Orders /></></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><><Navbar /><Wishlist /></></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><><Navbar /><MyAccount /></></ProtectedRoute>} />

        {/* Owner */}
        <Route path="/owner/create" element={<ProtectedRoute><CreateProduct /></ProtectedRoute>} />
        <Route path="/owner/products" element={<ProtectedRoute><OwnerProducts /></ProtectedRoute>} />
        <Route path="/owner/products/edit/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
      </Routes>
    </>
  )
}
