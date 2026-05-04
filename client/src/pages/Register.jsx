import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'

export default function Register() {
  const [form, setForm] = useState({ fullname: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')
    setLoading(true)
    try {
      const data = await register(form.fullname, form.email, form.password)
      if (data.success) { toast.success('Account created!'); navigate('/shop') }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="nav-logo" style={{ display: 'block', textAlign: 'center', marginBottom: '2rem' }}>Shopora</Link>
        <h2 className="auth-title">Create Your Account</h2>
        <p className="auth-subtitle">Join Shopora and explore premium products with ease.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" type="text" value={form.fullname} onChange={e => set('fullname', e.target.value)} placeholder="e.g. Jane Doe" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Minimum 8 characters" required minLength={8} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)' }}>
                {showPw ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
              </button>
            </div>
            <div style={{ marginTop: '.5rem', fontSize: '.75rem', color: 'var(--text-muted)' }}>
              <p>• At least 8 characters</p>
              <p>• Include uppercase, lowercase, and a number</p>
            </div>
          </div>
          <button className="btn btn-accent btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create My Account'}
          </button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}
