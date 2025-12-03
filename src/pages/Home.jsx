import { useState, useEffect } from 'react'
import ItemCard from '../ui/ItemCard'
import { api } from '../api/client'

export default function Home(){
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/menu')
      setMenuItems(response.data.items || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching menu:', err)
      setError('Failed to load menu items')
    } finally {
      setLoading(false)
    }
  }

  const categories = ['All', ...Array.from(new Set(menuItems.map(i=>i.category)))]
  const items = menuItems.filter(i=>(category==='All' || i.category===category) && i.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section with Background Image */}
      <div
        className="relative text-white py-24 px-4 mb-8 shadow-lg bg-cover bg-center"
        style={{
          backgroundImage: 'url(/group pic.jpeg)',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        <div className="relative max-w-7xl mx-auto text-center z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">Welcome to Bento Baitos</h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto drop-shadow-md">
            Our P4 Project: A Taste of Home
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        {/* Search & Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                value={query}
                onChange={e=>setQuery(e.target.value)}
                placeholder="Search for your favorite items..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4B7342] focus:outline-none focus:ring-2 focus:ring-[#4B7342] focus:ring-opacity-20 transition-all text-base"
              />
            </div>

            {/* Category Filter */}
            <div className="relative md:w-64">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <select
                value={category}
                onChange={e=>setCategory(e.target.value)}
                className="w-full pl-12 pr-10 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4B7342] focus:outline-none focus:ring-2 focus:ring-[#4B7342] focus:ring-opacity-20 transition-all text-base font-medium appearance-none cursor-pointer bg-white"
              >
                {categories.map(c=> <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(query || category !== 'All') && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600 font-medium">Active filters:</span>
              {category !== 'All' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#4B7342] text-white text-sm font-medium rounded-full">
                  {category}
                  <button onClick={() => setCategory('All')} className="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {query && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-600 text-white text-sm font-medium rounded-full">
                  "{query}"
                  <button onClick={() => setQuery('')} className="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              <button
                onClick={() => {setQuery(''); setCategory('All')}}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            {category === 'All' ? 'Our Menu' : category}
          </h2>
          <span className="text-sm text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
            {items.length} {items.length === 1 ? 'item' : 'items'} found
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <svg className="animate-spin h-12 w-12 text-[#4B7342] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p className="text-gray-600">Loading menu...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={fetchMenuItems}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Menu Grid */}
        {!loading && !error && items.length > 0 ? (
          <>
            {/* Mobile: Horizontal Scrollable */}
            <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex gap-4" style={{ width: 'max-content' }}>
                {items.map(i=> (
                  <div key={i.id} style={{ width: '280px', flexShrink: 0 }}>
                    <ItemCard item={i} />
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop: 4 Column Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map(i=> <ItemCard key={i.id} item={i} />)}
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No items found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {setQuery(''); setCategory('All')}}
              className="bg-[#4B7342] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-[#3d5c35] transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
