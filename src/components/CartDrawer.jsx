import { useContext, useState } from 'react'
import { CartContext } from '../state/CartContext'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function CartDrawer(){
  const { cart, subtotal, remove } = useContext(CartContext)
  const [isMinimized, setIsMinimized] = useState(false)

  if (!cart.length) return null

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-4 bottom-4 w-96 bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200 z-40"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#6B4E3D] to-[#8B6F5F] text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="font-bold text-lg">Your Cart</h3>
          <span className="bg-white bg-opacity-20 text-white text-xs font-bold px-2 py-1 rounded-full">
            {cart.length}
          </span>
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 transition-colors"
          aria-label={isMinimized ? "Expand cart" : "Minimize cart"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMinimized ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            )}
          </svg>
        </button>
      </div>

      {/* Cart Items */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-h-64 overflow-y-auto p-4 space-y-3">
              <AnimatePresence mode="popLayout">
                {cart.map((it, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                    className="bg-gray-50 rounded-xl p-3 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{it.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-[#4B7342] text-white px-2 py-0.5 rounded-full font-medium">
                            Qty: {it.quantity}
                          </span>
                          <span className="text-sm text-gray-600 font-medium">
                            Rp {it.unit_price_cents.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="font-bold text-[#4B7342]">
                          Rp {(it.unit_price_cents * it.quantity).toLocaleString()}
                        </div>
                        <motion.button
                          onClick={() => remove(idx)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Total Section */}
            <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-base font-semibold text-gray-700">Subtotal</span>
                <motion.div
                  key={subtotal()}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold text-[#4B7342]"
                >
                  Rp {subtotal().toLocaleString()}
                </motion.div>
              </div>

              <div className="flex gap-2">
                <Link
                  to="/cart"
                  className="flex-1 text-center py-3 rounded-xl border-2 border-[#4B7342] text-[#4B7342] font-bold hover:bg-gray-100 transition-colors"
                >
                  View Cart
                </Link>
                <Link
                  to="/checkout"
                  className="flex-1 bg-gradient-to-r from-[#4B7342] to-[#5a8850] text-white text-center py-3 rounded-xl font-bold hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Checkout
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
