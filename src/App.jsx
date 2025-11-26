import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ItemPage from './pages/ItemPage'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderStatus from './pages/OrderStatus'
import AdminLayout from './admin/AdminLayout'
import Header from './components/Header'
import CartDrawer from './components/CartDrawer'

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <CartDrawer />
      <main className="p-4 max-w-6xl mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/item/:id" element={<ItemPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/status/:orderId" element={<OrderStatus />} />
          <Route path="/admin/*" element={<AdminLayout />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
