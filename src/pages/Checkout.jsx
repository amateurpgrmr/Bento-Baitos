import { useContext, useState } from 'react'
import { CartContext } from '../state/CartContext'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../api/client'

export default function Checkout(){
  const { cart, subtotal, clear } = useContext(CartContext)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [proof, setProof] = useState(null)
  const [proofPreview, setProofPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  function handleFileChange(e){
    const file = e.target.files[0]
    if(file){
      setProof(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setProofPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  async function placeOrder(){
    if(!name || !phone) return alert('Please enter name and phone')
    if(cart.length === 0) return alert('Your cart is empty')

    setLoading(true)

    // Create order payload
    const payload = {
      customer_name: name,
      phone,
      items: cart.map(i=>({
        item_id:i.item_id,
        name:i.name,
        quantity:i.quantity,
        unit_price_cents:i.unit_price_cents,
        customizations:i.customizations
      })),
      payment_method: paymentMethod
    }

    try {
      // Try to create order via API
      const res = await api.post('/api/orders', payload)
      const { order_uid } = res.data

      // For cash payments, clear cart immediately
      if (paymentMethod === 'cash') {
        clear()
      } else {
        // For bank transfer, handle proof upload
        if (proof) {
          const fd = new FormData()
          fd.append('proof', proof)
          await api.post(`/api/orders/${order_uid}/proof`, fd)
          clear()
        } else {
          // Store pending order info in localStorage for later payment proof upload
          const pendingOrder = {
            order_uid,
            customer_name: name,
            phone,
            total: subtotal(),
            created_at: new Date().toISOString()
          }
          localStorage.setItem('pending_order', JSON.stringify(pendingOrder))
        }
      }

      // Redirect to order status
      nav(`/status/${order_uid}`)
    } catch(e){
      console.error('Order error:', e)
      alert('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if(cart.length === 0){
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white rounded-3xl shadow-xl p-12 max-w-md border border-gray-100"
        >
          <div className="mb-6">
            <svg className="w-32 h-32 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
          <p className="text-gray-600 mb-8 text-lg">Add some delicious items to your cart before checking out</p>
          <motion.button
            onClick={() => nav('/')}
            className="bg-gradient-to-r from-[#4B7342] to-[#5a8850] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Browse Menu
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order and enjoy your meal</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Customer info and payment proof - Takes 3 columns */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Payment Method Selection */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#4B7342] text-white p-3 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Payment Method</h3>
                  <p className="text-sm text-gray-600">Choose how you'd like to pay</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Cash Option */}
                <motion.button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    paymentMethod === 'cash'
                      ? 'border-[#4B7342] bg-green-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${paymentMethod === 'cash' ? 'bg-[#4B7342] text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg mb-1">Cash</div>
                      <div className="text-sm text-gray-600">Pay when you receive your order</div>
                    </div>
                    {paymentMethod === 'cash' && (
                      <svg className="w-6 h-6 text-[#4B7342]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </motion.button>

                {/* Bank Transfer Option */}
                <motion.button
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-[#4B7342] bg-green-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${paymentMethod === 'bank_transfer' ? 'bg-[#4B7342] text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg mb-1">Bank Transfer</div>
                      <div className="text-sm text-gray-600">Transfer to our bank account</div>
                    </div>
                    {paymentMethod === 'bank_transfer' && (
                      <svg className="w-6 h-6 text-[#4B7342]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Customer Information Card */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#4B7342] text-white p-3 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Customer Information</h3>
                  <p className="text-sm text-gray-600">We'll use this to contact you</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={e=>setName(e.target.value)}
                      className={`w-full px-5 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4B7342] focus:ring-opacity-20 transition-all text-base ${
                        name ? 'border-[#4B7342] bg-green-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {name && (
                      <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4B7342]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={e=>setPhone(e.target.value)}
                      className={`w-full px-5 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4B7342] focus:ring-opacity-20 transition-all text-base ${
                        phone ? 'border-[#4B7342] bg-green-50' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 081234567890"
                    />
                    {phone && (
                      <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4B7342]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Proof Upload Card - Only for Bank Transfer */}
            {paymentMethod === 'bank_transfer' && (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#4B7342] text-white p-3 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Payment Details</h3>
                  <p className="text-sm text-gray-600">Transfer to our bank account</p>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-gradient-to-br from-[#4B7342] to-[#5a8850] text-white p-6 rounded-2xl mb-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="font-bold text-lg">Transfer to:</span>
                </div>
                <div className="space-y-2 text-base">
                  <div className="flex justify-between items-center bg-white bg-opacity-10 rounded-lg p-3">
                    <span className="font-medium opacity-90">Bank</span>
                    <span className="font-bold">BCA</span>
                  </div>
                  <div className="flex justify-between items-center bg-white bg-opacity-10 rounded-lg p-3">
                    <span className="font-medium opacity-90">Account</span>
                    <span className="font-bold font-mono">1234567890</span>
                  </div>
                  <div className="flex justify-between items-center bg-white bg-opacity-10 rounded-lg p-3">
                    <span className="font-medium opacity-90">Name</span>
                    <span className="font-bold">Bento Baitos</span>
                  </div>
                </div>
              </div>

              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upload Transfer Proof (Optional)
              </label>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-[#4B7342] transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#4B7342] file:text-white hover:file:bg-[#3d5c35] cursor-pointer file:transition-all file:shadow-md"
                />
              </div>

              {/* Preview */}
              {proofPreview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 bg-gray-50 p-4 rounded-2xl border-2 border-[#4B7342]"
                >
                  <div className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#4B7342]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Preview:
                  </div>
                  <img
                    src={proofPreview}
                    alt="Payment proof preview"
                    className="w-full max-h-64 object-contain rounded-xl border-2 border-gray-200 bg-white"
                  />
                  <div className="text-sm text-gray-600 mt-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {proof?.name} ({(proof?.size / 1024).toFixed(1)} KB)
                  </div>
                </motion.div>
              )}
            </div>
            )}
          </motion.div>

          {/* Right: Order Summary - Takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            {/* Order Summary Card */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#4B7342] text-white p-3 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Order Summary</h3>
                  <p className="text-sm text-gray-600">{cart.length} items</p>
                </div>
              </div>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 truncate">{item.name}</div>
                      <div className="text-sm text-gray-600 mt-1">Qty: {item.quantity}</div>
                      {item.customizations && Object.keys(item.customizations).length > 0 && (
                        <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                          {Object.entries(item.customizations).map(([key, val]) => (
                            <span key={key} className="bg-gray-200 px-2 py-0.5 rounded-full">
                              {Array.isArray(val) ? val.join(', ') : val}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-[#4B7342] whitespace-nowrap">
                      Rp {(item.unit_price_cents * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-gray-200 pt-6 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-700">Total</span>
                  <motion.span
                    key={subtotal()}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold text-[#4B7342]"
                  >
                    Rp {subtotal().toLocaleString()}
                  </motion.span>
                </div>
              </div>

              {/* Place Order Button */}
              <motion.button
                onClick={placeOrder}
                disabled={loading || !name || !phone}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
                  loading || !name || !phone
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#4B7342] to-[#5a8850] text-white hover:shadow-xl'
                }`}
                whileHover={!loading && name && phone ? { scale: 1.02 } : {}}
                whileTap={!loading && name && phone ? { scale: 0.98 } : {}}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Placing Order...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Place Order
                  </>
                )}
              </motion.button>

              {(!name || !phone) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg flex items-center gap-2"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Please fill in all required fields
                </motion.div>
              )}

              <div className="mt-4 text-xs text-gray-500 text-center flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure checkout - Your data is protected
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
