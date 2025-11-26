import { useContext, useState } from 'react'
import { CartContext } from '../state/CartContext'
import { Link } from 'react-router-dom'

export default function Header() {
  const { cart } = useContext(CartContext)
  const count = cart.reduce((s,i)=>s+i.quantity,0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 bg-white shadow-lg backdrop-blur-sm bg-opacity-95 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-all duration-200 group"
          >
            <img
              src="/logo.jpeg"
              alt="Bento Baitos"
              className="h-10 md:h-14 group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-base font-semibold text-gray-700 hover:text-[#6B4E3D] transition-colors duration-200 relative group"
            >
              Menu
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#6B4E3D] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/admin"
              className="text-base font-semibold text-gray-600 hover:text-[#6B4E3D] transition-colors duration-200 relative group"
            >
              Admin
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#6B4E3D] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/cart"
              className="relative bg-gradient-to-r from-[#4B7342] to-[#5a8850] text-white px-6 py-2.5 rounded-full text-base font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Cart
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-br from-[#EF4444] to-[#DC2626] text-white text-xs w-7 h-7 flex items-center justify-center rounded-full font-bold shadow-lg animate-pulse">
                  {count}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-3 animate-fadeIn">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#6B4E3D] rounded-lg transition-colors"
            >
              Menu
            </Link>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-base font-semibold text-gray-600 hover:bg-gray-50 hover:text-[#6B4E3D] rounded-lg transition-colors"
            >
              Admin
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 text-base font-semibold bg-gradient-to-r from-[#4B7342] to-[#5a8850] text-white rounded-lg hover:shadow-md transition-all"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Cart
              </span>
              {count > 0 && (
                <span className="bg-[#EF4444] text-white text-xs px-2.5 py-1 rounded-full font-bold">
                  {count}
                </span>
              )}
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
