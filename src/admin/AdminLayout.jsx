import { Link, Routes, Route, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../state/AdminAuthContext'
import Dashboard from './Dashboard'
import MenuManager from './MenuManager'
import Orders from './Orders'
import ProofsReview from './ProofsReview'
import Stats from './Stats'

export default function AdminLayout(){
  const { logout } = useAdminAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="md:flex gap-6">
      <nav className="w-64 bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-4 text-lg">Admin Panel</h3>
        <ul className="space-y-2 text-sm">
          <li><Link to="" className="block px-3 py-2 rounded hover:bg-gray-100 transition-colors">Dashboard</Link></li>
          <li><Link to="orders" className="block px-3 py-2 rounded hover:bg-gray-100 transition-colors">Orders</Link></li>
          <li><Link to="stats" className="block px-3 py-2 rounded hover:bg-gray-100 transition-colors">Analytics & Stats</Link></li>
          <li><Link to="menu" className="block px-3 py-2 rounded hover:bg-gray-100 transition-colors">Menu Manager</Link></li>
          <li><Link to="proofs" className="block px-3 py-2 rounded hover:bg-gray-100 transition-colors">Payment Proofs</Link></li>
        </ul>
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
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
