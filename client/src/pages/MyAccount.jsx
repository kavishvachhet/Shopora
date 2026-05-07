import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { HiOutlinePencil } from 'react-icons/hi'

export default function MyAccount() {
  const { fetchUser } = useAuth()
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const fileRef = useRef()
  const menuRef = useRef()

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ fullname: '', contact: '' })
  
  const [isChangingPwd, setIsChangingPwd] = useState(false)
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/account').then(({ data }) => {
      setUser(data.user)
      setEditForm({ fullname: data.user.fullname || '', contact: data.user.contact || '' })
    }).catch(() => {})
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/account/update', editForm)
      toast.success('Profile updated!')
      setUser(data.user)
      setIsEditing(false)
      fetchUser()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/account/update-password', pwdForm)
      toast.success('Password updated!')
      setIsChangingPwd(false)
      setPwdForm({ currentPassword: '', newPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <div className="loader"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-inner" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="account-card" style={{ padding: '2.5rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', position: 'relative' }} ref={menuRef}>
              <div className="account-avatar" onClick={() => setMenuOpen(!menuOpen)}>
                {user.image ? <img src={user.image} alt="Profile" /> : user.fullname?.charAt(0).toUpperCase()}
              </div>
              {menuOpen && (
                <div style={{ position: 'absolute', left: 0, top: 88, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow)', zIndex: 10, overflow: 'hidden', minWidth: 150 }}>
                  <button onClick={() => fileRef.current?.click()} style={{ display: 'block', width: '100%', padding: '.6rem 1rem', background: 'none', border: 'none', textAlign: 'left', fontSize: '.85rem', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>Change Photo</button>
                  <button onClick={removeImage} style={{ display: 'block', width: '100%', padding: '.6rem 1rem', background: 'none', border: 'none', textAlign: 'left', fontSize: '.85rem', color: '#dc2626', cursor: 'pointer' }}>Remove Photo</button>
                </div>
              )}
              <input type="file" ref={fileRef} onChange={uploadImage} accept="image/*" style={{ display: 'none' }} />
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600 }}>{user.fullname}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>{user.email}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginTop: '.15rem' }}>📞 {user.contact || 'No phone number'}</p>
              </div>
            </div>
            {!isEditing && !isChangingPwd && (
              <button className="btn btn-outline btn-sm" onClick={() => setIsEditing(true)}>
                <HiOutlinePencil /> Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Edit Profile</h3>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" value={editForm.fullname} onChange={e => setEditForm({ ...editForm, fullname: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="text" className="form-input" value={editForm.contact} onChange={e => setEditForm({ ...editForm, contact: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="btn btn-accent" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          ) : isChangingPwd ? (
            <form onSubmit={handleUpdatePassword} style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Change Password</h3>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-input" value={pwdForm.currentPassword} onChange={e => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" value={pwdForm.newPassword} onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsChangingPwd(false)}>Cancel</button>
                <button type="submit" className="btn btn-accent" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>
              </div>
            </form>
          ) : (
            <button className="btn" style={{ background: 'var(--bg)', color: 'var(--text)', width: '100%', marginBottom: '1.5rem', textAlign: 'left', padding: '1rem' }} onClick={() => setIsChangingPwd(true)}>
              🔒 Change Password
            </button>
          )}

          <div className="account-grid" style={{ marginBottom: '1.5rem' }}>
            <Link to="/orders">📦<span>My Orders</span></Link>
            <Link to="/wishlist">❤️<span>Wishlist</span></Link>
          </div>
          
          <button className="btn btn-danger btn-full" style={{ background: '#fee2e2', color: '#dc2626', border: 'none' }} onClick={async () => { await api.get('/auth/logout'); window.location.href = '/' }}>Logout</button>
        </div>
      </div>
    </div>
  )
}
