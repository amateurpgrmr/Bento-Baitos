import { useParams, useNavigate } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import { CartContext } from '../state/CartContext'
import { api } from '../api/client'
import { motion } from 'framer-motion'

export default function OrderStatus(){
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [proof, setProof] = useState(null)
  const [proofPreview, setProofPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const { clear } = useContext(CartContext)
  const nav = useNavigate()

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/orders/${orderId}`)
      setOrder(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load order details')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if(file){
      setProof(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProofPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadProof = async () => {
    if (!proof) return alert('Please select a file first')

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('proof', proof)
      await api.post(`/api/orders/${orderId}/proof`, fd)

      // Clear pending order from localStorage
      localStorage.removeItem('pending_order')

      // Clear cart since payment proof is now uploaded
      clear()

      // Refresh order data
      await fetchOrder()

      // Clear upload state
      setProof(null)
      setProofPreview(null)

      alert('Payment proof uploaded successfully!')
    } catch (err) {
      alert('Failed to upload payment proof. Please try again.')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusProgress = (status) => {
    const progress = {
      pending: 20,
      paid: 40,
      preparing: 60,
      ready: 80,
      completed: 100,
      cancelled: 0
    }
    return progress[status] || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-[#4B7342] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || 'Order not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Status</h1>
          <p className="text-gray-600">Track your order and upload payment proof</p>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mb-6"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
              <p className="text-sm text-gray-500 font-mono mt-1">{order.order_uid}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status.toUpperCase()}
            </span>
          </div>

          {/* Status Progress Bar */}
          <div className="mb-6">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getStatusProgress(order.status)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#4B7342] to-[#5a8850]"
              />
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="text-xs font-bold text-blue-800 uppercase mb-2">Customer Information</h3>
            <p className="font-bold text-gray-900">{order.customer_name}</p>
            <p className="text-sm text-gray-700">{order.phone}</p>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-gray-700">Order Items:</h3>
            <ul className="space-y-2">
              {order.items?.map((item, idx) => (
                <li key={idx} className="bg-gray-50 p-3 rounded flex justify-between">
                  <div>
                    <span className="font-semibold">{item.quantity}x {item.item_name}</span>
                    {item.customizations && (
                      <div className="text-xs text-gray-600 mt-1">
                        {typeof item.customizations === 'string' ? item.customizations : JSON.stringify(item.customizations)}
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-[#4B7342]">Rp {item.unit_price.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Total */}
          <div className="border-t pt-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
              <span className="text-3xl font-bold text-[#4B7342]">Rp {order.total_price.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              Payment Method: <span className="font-medium">Bank Transfer</span>
            </p>
            {order.payment_proof_url ? (
              <div className="flex items-center gap-2 text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Payment proof submitted</span>
                <a href={order.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">View</a>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-medium">Payment proof not yet submitted</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Upload Payment Proof Section */}
        {!order.payment_proof_url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Payment Proof</h2>

            {/* Bank Details */}
            <div className="bg-gradient-to-br from-[#4B7342] to-[#5a8850] text-white p-6 rounded-2xl mb-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-bold text-lg">Transfer to:</span>
              </div>
              <div className="space-y-2">
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
                <div className="flex justify-between items-center bg-white bg-opacity-10 rounded-lg p-3">
                  <span className="font-medium opacity-90">Amount</span>
                  <span className="font-bold text-xl">Rp {order.total_price.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-[#4B7342] transition-colors mb-4">
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
                className="mb-6 bg-gray-50 p-4 rounded-2xl border-2 border-[#4B7342]"
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

            {/* Upload Button */}
            <button
              onClick={handleUploadProof}
              disabled={!proof || uploading}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
                !proof || uploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#4B7342] to-[#5a8850] text-white hover:shadow-xl'
              }`}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Payment Proof
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
