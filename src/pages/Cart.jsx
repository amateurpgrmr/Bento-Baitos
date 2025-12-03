import { useContext, useState, useEffect } from 'react'
import { CartContext } from '../state/CartContext'
import { Link } from 'react-router-dom'

export default function Cart(){
  const { cart, updateQty, remove, subtotal } = useContext(CartContext)
  const [pendingOrder, setPendingOrder] = useState(null)

  useEffect(() => {
    // Check for pending order in localStorage
    const pending = localStorage.getItem('pending_order')
    if (pending) {
      try {
        setPendingOrder(JSON.parse(pending))
      } catch (e) {
        console.error('Error parsing pending order:', e)
      }
    }
  }, [])

  const dismissPendingOrder = () => {
    localStorage.removeItem('pending_order')
    setPendingOrder(null)
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Cart</h2>

      {/* Pending Payment Notification */}
      {pendingOrder && (
        <div className="mb-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 shadow-md">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-bold text-yellow-900 mb-1">Pending Payment</h3>
              <p className="text-sm text-yellow-800 mb-2">
                You have an order awaiting payment proof (Rp {pendingOrder.total?.toLocaleString()})
              </p>
              <div className="flex gap-2 flex-wrap">
                <Link
                  to={`/status/${pendingOrder.order_uid}`}
                  className="text-sm bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 font-medium"
                >
                  Upload Payment Proof
                </Link>
                <button
                  onClick={dismissPendingOrder}
                  className="text-sm border border-yellow-600 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-100 font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!cart.length && <div>Your cart is empty. <Link to="/">Explore menu</Link></div>}
      {cart.map((it, idx)=>(
        <div key={idx} className="flex justify-between items-center p-3 bg-white rounded mb-2 shadow">
          <div>
            <div className="font-medium">{it.name}</div>
            <div className="text-sm text-gray-500">Rp {it.unit_price_cents.toLocaleString()}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=> updateQty(idx, Math.max(1, it.quantity-1)) } className="px-2 border rounded">-</button>
            <div>{it.quantity}</div>
            <button onClick={()=> updateQty(idx, it.quantity+1) } className="px-2 border rounded">+</button>
            <button onClick={()=> remove(idx) } className="text-red-500 ml-2">Remove</button>
          </div>
        </div>
      ))}
      <div className="mt-4 p-3 bg-white rounded shadow">
        <div className="flex justify-between"><div>Subtotal</div><div>Rp {subtotal().toLocaleString()}</div></div>
        <Link to="/checkout" className="block mt-3 bg-black text-white text-center py-2 rounded">Proceed to Checkout</Link>
      </div>
    </div>
  )
}
