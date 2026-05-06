import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'

// Helper to load Razorpay script dynamically
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = src
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function Checkout() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [keyId, setKeyId] = useState('')
  const [form, setForm] = useState({ address: '', city: '', state: '', pincode: '' })
  const [paymentMethod, setPaymentMethod] = useState('Online') // Default to Online for testing
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    api.get('/checkout').then(({ data }) => {
      setItems(data.items);
      setTotal(data.totalAmount);
      setKeyId(data.keyId);
    }).catch(() => navigate('/cart'))
  }, [])

  const placeOrder = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (paymentMethod === 'COD') {
        const { data } = await api.post('/orders/place', { ...form, paymentMethod: 'COD' })
        if (data.success) { toast.success('Order placed!'); navigate('/orders') }
      } else {
        // ONLINE PAYMENT FLOW (Razorpay)
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js")
        if (!res) {
          toast.error("Razorpay SDK failed to load. Are you online?")
          setLoading(false)
          return
        }

        // 1. Create order on backend
        const { data: order } = await api.post('/orders/razorpay/create', { amount: total })

        // 2. Open Razorpay modal
        const options = {
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          name: "Shopora",
          description: "Test Transaction",
          order_id: order.id,
          handler: async function (response) {
            try {
              // 3. Verify signature on backend
              const verifyRes = await api.post('/orders/razorpay/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })

              if (verifyRes.data.success) {
                // 4. Place actual order
                const { data } = await api.post('/orders/place', { ...form, paymentMethod: 'Online' })
                if (data.success) {
                  toast.success('Payment successful! Order placed.')
                  navigate('/orders')
                }
              }
            } catch (err) {
              toast.error("Payment verification failed")
            }
          },
          prefill: {
            name: "Test User",
            email: "test@example.com",
            contact: "9999999999"
          },
          theme: { color: "#c45d3e" },
          modal: {
            ondismiss: function () {
              toast.error("Payment Cancelled")
              setLoading(false)
            }
          }
        }

        const paymentObject = new window.Razorpay(options)
        paymentObject.on('payment.failed', function (response) {
          toast.error("Payment Failed: " + response.error.description)
          setLoading(false)
        })
        paymentObject.open()
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to process order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-inner">
        <h1 className="page-title">Checkout</h1>
        <div className="checkout-layout">
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>Delivery Address</h2>
            <form onSubmit={placeOrder} id="checkout-form">
              <div className="form-group">
                <label className="form-label">Full Street Address</label>
                <textarea className="form-input" value={form.address} onChange={e => set('address', e.target.value)} rows={3} placeholder="e.g. 402, Sunshine Residency, Park Street" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group"><label className="form-label">City</label><input className="form-input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Ahmedabad" required /></div>
                <div className="form-group"><label className="form-label">Pincode</label><input className="form-input" value={form.pincode} onChange={e => set('pincode', e.target.value)} placeholder="380001" required /></div>
              </div>
              <div className="form-group"><label className="form-label">State</label><input className="form-input" value={form.state} onChange={e => set('state', e.target.value)} placeholder="Gujarat" required /></div>

              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Payment Method</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div
                    onClick={() => setPaymentMethod('Online')}
                    style={{ flex: 1, padding: '1rem', border: `2px solid ${paymentMethod === 'Online' ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius)', background: paymentMethod === 'Online' ? 'var(--accent-light)' : 'transparent', cursor: 'pointer' }}
                  >
                    <p style={{ fontWeight: 600 }}>Pay Online</p>
                    <p style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>Cards, UPI, NetBanking</p>
                  </div>
                  <div
                    onClick={() => setPaymentMethod('COD')}
                    style={{ flex: 1, padding: '1rem', border: `2px solid ${paymentMethod === 'COD' ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius)', background: paymentMethod === 'COD' ? 'var(--accent-light)' : 'transparent', cursor: 'pointer' }}
                  >
                    <p style={{ fontWeight: 600 }}>Cash on Delivery</p>
                    <p style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>Pay at your doorstep</p>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div className="summary">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.25rem' }}>Order Summary</h3>
            <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: '1rem' }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '.75rem', alignItems: 'center', marginBottom: '.75rem' }}>
                  <div style={{ width: 48, height: 48, background: 'var(--bg)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0 }}>
                    {item.productId.image && <img src={item.productId.image} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} alt="" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.productId.name}</p>
                    <p style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '.9rem' }}>₹{(item.finalPrice * item.quantity).toFixed(0)}</p>
                </div>
              ))}
            </div>
            <div className="summary-row"><span>Subtotal</span><span>₹{total}</span></div>
            <div className="summary-row"><span>Shipping</span><span style={{ color: 'var(--olive)', fontWeight: 600 }}>FREE</span></div>
            <div className="summary-total"><span>Total</span><span style={{ color: 'var(--accent)' }}>₹{total}</span></div>
            <button form="checkout-form" type="submit" className="btn btn-accent btn-full btn-lg" disabled={loading || total <= 0} style={{ marginTop: '1.5rem' }}>
              {loading ? 'Processing...' : (paymentMethod === 'Online' ? 'Pay Now' : 'Complete Order')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
