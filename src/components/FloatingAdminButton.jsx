import { Link, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../state/AdminAuthContext'
import { motion } from 'framer-motion'

export default function FloatingAdminButton() {
  const { isAuthenticated } = useAdminAuth()
  const location = useLocation()

  // Don't show on admin pages
  if (!isAuthenticated || location.pathname.startsWith('/admin')) {
    return null
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <Link
        to="/admin"
        className="flex items-center gap-2 bg-gradient-to-r from-[#6B4E3D] to-[#7A5737] text-white px-5 py-3 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-200 font-semibold"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="hidden sm:inline">Admin</span>
      </Link>
    </motion.div>
  )
}
