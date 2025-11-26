import { useContext } from 'react'
import { CartContext } from '../state/CartContext'
import { Link } from 'react-router-dom'

export default function Cart(){
  const { cart, updateQty, remove, subtotal } = useContext(CartContext)
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Cart</h2>
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
