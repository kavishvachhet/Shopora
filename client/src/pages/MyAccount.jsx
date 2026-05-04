import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function MyAccount() {
  const { user: authUser, fetchUser } = useAuth()
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const fileRef = useRef()
  const menuRef = useRef()

  useEffect(() => {
    api.get('/account').then(({ data }) => setUser(data.user)).catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const uploadImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('image', file)
    try {
      const { data } = await api.post('/account/upload-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      if (data.success) { toast.success('Photo updated!'); setUser(p => ({ ...p, image: data.image })); fetchUser() }
    } catch { toast.error('Upload failed') }
    setMenuOpen(false)
  }

  const removeImage = async () => {
    try {
      await api.post('/account/remove-image')
      toast.success('Photo removed!')
      setUser(p => ({ ...p, image: null }))
      fetchUser()
    } catch { toast.error('Failed') }
    setMenuOpen(false)
  }

  if (!user) return <div className="loader"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-inner">
        <div className="account-card">
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', marginBottom: '1.5rem', position: 'relative' }} ref={menuRef}>
            <div className="account-avatar" onClick={() => setMenuOpen(!menuOpen)}>
              {user.image ? <img src={`data:image/jpeg;base64,${user.image}`} alt="Profile" /> : user.fullname?.charAt(0).toUpperCase()}
            </div>
            {menuOpen && (
              <div style={{ position: 'absolute', left: 0, top: 88, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow)', zIndex: 10, overflow: 'hidden', minWidth: 150 }}>
                <button onClick={() => fileRef.current?.click()} style={{ display: 'block', width: '100%', padding: '.6rem 1rem', background: 'none', border: 'none', textAlign: 'left', fontSize: '.85rem', borderBottom: '1px solid var(--border)' }}>Change Photo</button>
                <button onClick={removeImage} style={{ display: 'block', width: '100%', padding: '.6rem 1rem', background: 'none', border: 'none', textAlign: 'left', fontSize: '.85rem', color: '#dc2626' }}>Remove Photo</button>
              </div>
            )}
            <input type="file" ref={fileRef} onChange={uploadImage} accept="image/*" style={{ display: 'none' }} />
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600 }}>{user.fullname}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>{user.email}</p>
              {user.contact && <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginTop: '.15rem' }}>📞 {user.contact}</p>}
            </div>
          </div>
          <div className="account-grid">
            <Link to="/orders">📦<span>My Orders</span></Link>
            <Link to="/wishlist">❤️<span>Wishlist</span></Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            <Link to="/shop" className="btn btn-accent btn-full">Go to Shop</Link>
            <button className="btn btn-outline btn-full" onClick={async () => { await api.get('/auth/logout'); window.location.href = '/' }}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  )
}
