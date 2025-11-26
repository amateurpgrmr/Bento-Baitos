import { Link, Routes, Route } from 'react-router-dom'
import Dashboard from './Dashboard'
import MenuManager from './MenuManager'
import Orders from './Orders'
import ProofsReview from './ProofsReview'
import Stats from './Stats'

export default function AdminLayout(){
  return (
    <div className="md:flex gap-6">
      <nav className="w-64 bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-4">Admin</h3>
        <ul className="space-y-2 text-sm">
          <li><Link to="">Dashboard</Link></li>
          <li><Link to="orders">Orders</Link></li>
          <li><Link to="stats">Analytics & Stats</Link></li>
          <li><Link to="menu">Menu Manager</Link></li>
          <li><Link to="proofs">Payment Proofs</Link></li>
        </ul>
      </nav>
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard/>} />
          <Route path="orders" element={<Orders/>} />
          <Route path="stats" element={<Stats/>} />
          <Route path="menu" element={<MenuManager/>} />
          <Route path="proofs" element={<ProofsReview/>} />
        </Routes>
      </div>
    </div>
  )
}
