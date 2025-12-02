import { useState } from 'react'
import ItemCard from '../ui/ItemCard'

const SAMPLE_ITEMS = [
  {id:1, name:'Curry Rice', price_cents:39000, category:'Rice Bowls', img:'/curry.jpeg'},
  {id:2, name:'Panda Teriyaki', price_cents:35000, category:'Rice Bowls', img:'/panda teriyaki.jpeg'},
  {id:3, name:'Japanese Sando', price_cents:42000, category:'Desserts', img:'/japanese sando.jpeg'},
  {id:4, name:'Java Tea', price_cents:18000, category:'Beverages', img:'/java tea.jpeg'}
]

export default function Home(){
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const categories = ['All', ...Array.from(new Set(SAMPLE_ITEMS.map(i=>i.category)))]
  const items = SAMPLE_ITEMS.filter(i=>(category==='All' || i.category===category) && i.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#6B4E3D] to-[#8B6F5F] text-white py-12 px-4 mb-8 shadow-lg">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Welcome to Bento Baitos</h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto">
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

        {/* Menu Grid */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map(i=> <ItemCard key={i.id} item={i} />)}
          </div>
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
