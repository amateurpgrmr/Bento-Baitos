import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function ItemCard({item}){
  return (
    <Link to={`/item/${item.id}`} className="group">
      <motion.div
        className="block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
        whileHover={{ y: -8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {/* Image Container */}
        <div className="relative h-56 overflow-hidden bg-gray-100">
          <img
            src={item.image_url || item.img}
            alt={item.name}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${item.is_sold_out ? 'opacity-50' : ''}`}
          />
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-white bg-opacity-90 backdrop-blur-sm text-[#6B4E3D] text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
              {item.category}
            </span>
          </div>
          {/* Stock Status Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {item.is_featured === 1 && (
              <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Featured
              </span>
            )}
            {item.is_sold_out && (
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                Sold Out
              </span>
            )}
            {!item.is_sold_out && item.is_low_stock && (
              <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                Low Stock
              </span>
            )}
          </div>
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
          {/* Quick View Text */}
          {!item.is_sold_out && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-white text-[#6B4E3D] px-6 py-2.5 rounded-full font-bold text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                View Details
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-[#6B4E3D] transition-colors line-clamp-1">
            {item.name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium">Price</span>
              <span className="text-xl font-bold text-[#4B7342]">
                Rp {(item.price_cents / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="bg-[#4B7342] text-white p-2.5 rounded-full group-hover:bg-[#3d5c35] transition-colors shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
