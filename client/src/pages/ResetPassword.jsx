import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const { token } = useParams()
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      const { data } = await api.post(`/password/reset/${token}`, form)
      if (data.success) { toast.success('Password reset! Please login.'); navigate('/login') }
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Reset Your Password</h2>
        <p className="auth-subtitle">Enter your new password below.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input className="form-input" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Enter new password" required minLength={6} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className="form-input" type="password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="Confirm new password" required minLength={6} />
          </div>
          <button className="btn btn-accent btn-full btn-lg" type="submit" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
        </form>
      </div>
    </div>
  )
}
