import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { HiOutlineLockClosed } from 'react-icons/hi'

export default function OwnerLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { fetchUser } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const { data } = await api.post('/owner/login', form)
      if (data.success) { 
        await fetchUser();
        toast.success('Welcome!'); 
        navigate('/owner/products');
      }
    } catch (err) { toast.error(err.response?.data?.error || 'Login failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--charcoal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <HiOutlineLockClosed size={24} color="#fff" />
          </div>
          <h2 className="auth-title">Owner Portal</h2>
          <p className="auth-subtitle">Sign in to manage your dashboard</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="owner@example.com" required /></div>
          <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" required /></div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  )
}
