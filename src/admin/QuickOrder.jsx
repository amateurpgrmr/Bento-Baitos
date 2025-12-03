import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../api/client'

export default function QuickOrder() {
  const [menu, setMenu] = useState([])
  const [orderItems, setOrderItems] = useState([]) // { item, quantity }
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastOrderUid, setLastOrderUid] = useState('')

  useEffect(() => {
    loadMenu()
  }, [])

  async function loadMenu() {
    try {
      const response = await api.get('/api/admin/menu')
      setMenu(response.data.items || [])
    } catch (error) {
      console.error('Failed to load menu:', error)
    } finally {
      setLoading(false)
    }
  }

  function addToOrder(item) {
    const existing = orderItems.find(oi => oi.item.id === item.id)
    if (existing) {
      setOrderItems(orderItems.map(oi =>
        oi.item.id === item.id
          ? { ...oi, quantity: oi.quantity + 1 }
          : oi
      ))
    } else {
      setOrderItems([...orderItems, { item, quantity: 1 }])
    }
  }

  function updateQuantity(itemId, newQty) {
    if (newQty <= 0) {
      setOrderItems(orderItems.filter(oi => oi.item.id !== itemId))
    } else {
      setOrderItems(orderItems.map(oi =>
        oi.item.id === itemId
          ? { ...oi, quantity: newQty }
          : oi
      ))
    }
  }

  function clearOrder() {
    setOrderItems([])
    setCustomerName('')
  }

  function getTotal() {
    return orderItems.reduce((sum, oi) => sum + (oi.item.price * oi.quantity), 0)
  }

  async function placeOrder() {
    if (orderItems.length === 0) {
      alert('Please add items to the order')
      return
    }

    if (!customerName.trim()) {
      alert('Please enter customer name')
      return
    }

    setPlacing(true)

    const payload = {
      customer_name: customerName,
      phone: customerName, // Use name as phone for compatibility
      items: orderItems.map(oi => ({
        item_id: oi.item.id,
        name: oi.item.name,
        quantity: oi.quantity,
        unit_price_cents: oi.item.price,
        customizations: {}
      })),
      payment_method: 'cash'
    }

    try {
      const res = await api.post('/api/orders', payload)
      const { order_uid, order_id } = res.data

      // Auto-set status to paid since it's a cash order from admin
      await api.put(`/api/admin/orders/${order_id}/status`, { status: 'paid' })

      setLastOrderUid(order_uid)
      setShowSuccess(true)
      clearOrder()

      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000)
    } catch (error) {
      console.error('Failed to place order:', error)
      alert('Failed to place order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-[#4B7342] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading menu...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-[#6B4E3D] mb-2">Quick Order</h2>
        <p className="text-gray-600">Place orders directly from the admin panel</p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6 bg-green-50 border-2 border-green-500 text-green-800 p-4 rounded-xl flex items-center gap-3"
        >
          <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <div className="font-bold">Order Placed Successfully!</div>
            <div className="text-sm">Order ID: {lastOrderUid}</div>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Menu Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Select Items</h3>

            <div className="grid md:grid-cols-2 gap-4">
              {menu.map(item => (
                <motion.button
                  key={item.id}
                  onClick={() => addToOrder(item)}
                  disabled={!item.available}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    item.available
                      ? 'border-gray-200 hover:border-[#4B7342] hover:bg-green-50 cursor-pointer'
                      : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                  }`}
                  whileHover={item.available ? { scale: 1.02 } : {}}
                  whileTap={item.available ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-start gap-3">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 mb-1">{item.name}</div>
                      <div className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</div>
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-[#4B7342]">
                          Rp {item.price.toLocaleString()}
                        </div>
                        {!item.available && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                            Unavailable
                          </span>
                        )}
                        {item.stock > 0 && item.stock <= item.low_stock_threshold && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                            Low Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {menu.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No menu items available
              </div>
            )}
          </div>
        </div>

        {/* Right: Current Order */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-md sticky top-24">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Current Order</h3>

            {/* Customer Name */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4B7342] focus:border-[#4B7342] transition-all"
              />
            </div>

            {/* Order Items */}
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {orderItems.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-sm">No items added</p>
                </div>
              ) : (
                orderItems.map(oi => (
                  <div key={oi.item.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 font-semibold text-gray-900">{oi.item.name}</div>
                      <button
                        onClick={() => updateQuantity(oi.item.id, 0)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(oi.item.id, oi.quantity - 1)}
                          className="w-7 h-7 bg-white border-2 border-gray-300 rounded-lg hover:border-[#4B7342] transition-colors flex items-center justify-center"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-8 text-center font-bold">{oi.quantity}</span>
                        <button
                          onClick={() => updateQuantity(oi.item.id, oi.quantity + 1)}
                          className="w-7 h-7 bg-white border-2 border-gray-300 rounded-lg hover:border-[#4B7342] transition-colors flex items-center justify-center"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                      <div className="font-bold text-[#4B7342]">
                        Rp {(oi.item.price * oi.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            {orderItems.length > 0 && (
              <>
                <div className="border-t-2 border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-700">Total</span>
                    <span className="text-2xl font-bold text-[#4B7342]">
                      Rp {getTotal().toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Payment Method: Cash
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <motion.button
                    onClick={placeOrder}
                    disabled={placing || !customerName.trim()}
                    className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                      placing || !customerName.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#4B7342] to-[#5a8850] text-white hover:shadow-xl'
                    }`}
                    whileHover={!placing && customerName.trim() ? { scale: 1.02 } : {}}
                    whileTap={!placing && customerName.trim() ? { scale: 0.98 } : {}}
                  >
                    {placing ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Place Order
                      </>
                    )}
                  </motion.button>

                  <button
                    onClick={clearOrder}
                    disabled={placing}
                    className="w-full py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear Order
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
