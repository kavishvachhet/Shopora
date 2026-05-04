import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try { await api.post('/password/forgot', { email }); toast.success('Reset link sent!'); setSent(true) }
    catch { toast.error('Something went wrong') }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Forgot Password?</h2>
        <p className="auth-subtitle">Enter your email to receive a reset link.</p>
        {sent ? (
          <div className="flash flash-success">If an account exists with that email, a reset link has been sent. Check your inbox.</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Your Email Address</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <button className="btn btn-accent btn-full btn-lg" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
          </form>
        )}
        <p className="auth-footer"><Link to="/login">← Back to Login</Link></p>
      </div>
    </div>
  )
}
