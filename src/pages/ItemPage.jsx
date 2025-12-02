import { useParams, useNavigate } from 'react-router-dom'
import { useContext, useState } from 'react'
import { CartContext } from '../state/CartContext'
import { motion } from 'framer-motion'

// Sample menu data - in production, fetch from API or props
const MENU_ITEMS = {
  '1': {
    id: '1',
    name: 'Curry Rice',
    price: 20000,
    image: '/curry.jpeg',
    description: 'A hearty curry made with tender pork, carrots, and potatoes for a rich, comforting flavor in every bite.',
    customizations: [
      { id: 'spice', name: 'Spice Level', options: ['Mild', 'Medium', 'Hot', 'Extra Hot'] },
      { id: 'extras', name: 'Add-ons', options: ['Egg', 'Cheese', 'Extra Rice'], isMulti: true }
    ]
  },
  '2': {
    id: '2',
    name: 'Panda Teriyaki',
    price: 20000,
    image: '/panda teriyaki.jpeg',
    description: 'Tender chicken glazed with teriyaki sauce, served with rice alongside cabbage for a healthy delicious meal',
    customizations: [
      { id: 'extras', name: 'Add-ons', options: ['Extra Chicken', 'Extra Vegetables', 'Fried Egg'], isMulti: true }
    ]
  },
  '3': {
    id: '3',
    name: 'Japanese Sando',
    price: 10000,
    image: '/japanese sando.jpeg',
    description: 'A delicacy filled with sweet whipped cream, fresh shine muscat, strawberries, and a slice of mango!',
    customizations: []
  },
  '4': {
    id: '4',
    name: 'Java Tea',
    price: 10000,
    image: '/java tea.jpeg',
    description: 'A refreshing herbal blend made from pandan leaf, black tea, and basil seeds for a naturally aromatic and soothing drink.',
    customizations: [
      { id: 'ice', name: 'Ice Level', options: ['Regular Ice', 'Less Ice', 'No Ice'] },
      { id: 'sweetness', name: 'Sweetness', options: ['Regular', 'Less Sweet', 'No Sugar'] }
    ]
  }
}

export default function ItemPage(){
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useContext(CartContext)

  const item = MENU_ITEMS[id] || {
    id,
    name: 'Item Not Found',
    price: 0,
    image: '/logo.jpeg',
    description: 'This item does not exist.',
    customizations: []
  }

  const [qty, setQty] = useState(1)
  const [choices, setChoices] = useState({})

  function setChoice(custId, value, isMulti){
    if(isMulti) {
      setChoices(prev => {
        const current = prev[custId] || []
        const has = current.includes(value)
        return {
          ...prev,
          [custId]: has ? current.filter(v => v !== value) : [...current, value]
        }
      })
    } else {
      setChoices(prev => ({...prev, [custId]: value}))
    }
  }

  function handleAdd(){
    const payload = {
      item_id: item.id,
      name: item.name,
      unit_price_cents: item.price,
      quantity: qty,
      customizations: choices
    }
    addItem(payload)

    // Show success message with animation
    const btn = document.getElementById('add-to-cart-btn')
    if(btn){
      btn.textContent = '✓ Added!'
      btn.classList.add('bg-green-600')
      btn.classList.remove('bg-[#4B7342]')
      setTimeout(() => {
        btn.textContent = 'Add to Cart'
        btn.classList.remove('bg-green-600')
        btn.classList.add('bg-[#4B7342]')
      }, 1500)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back button */}
        <motion.button
          onClick={() => navigate('/')}
          className="mb-6 text-gray-600 hover:text-[#6B4E3D] flex items-center gap-2 font-medium group transition-colors"
          whileHover={{ x: -5 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <svg className="w-5 h-5 group-hover:text-[#6B4E3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Menu
        </motion.button>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Image with animation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="sticky top-24"
          >
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-6 border border-gray-100">
              <img
                src={item.image}
                alt={item.name}
                className="w-full aspect-square object-cover rounded-2xl"
              />
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
          >
            {/* Header */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{item.name}</h1>
              <p className="text-lg text-gray-600 leading-relaxed">{item.description}</p>
            </div>

            {/* Price Display */}
            <div className="mb-8 bg-gradient-to-r from-[#4B7342] to-[#5a8850] text-white rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90 mb-1">Price</p>
                  <p className="text-4xl font-bold">Rp {item.price.toLocaleString()}</p>
                </div>
                <svg className="w-16 h-16 opacity-20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                </svg>
              </div>
            </div>

            {/* Customizations */}
            {item.customizations.map(cust => (
              <div key={cust.id} className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-[#6B4E3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <h3 className="text-lg font-bold text-gray-800">{cust.name}</h3>
                  {cust.isMulti && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Multiple</span>}
                </div>
                <div className="flex flex-wrap gap-3">
                  {cust.options.map(opt => {
                    const isSelected = cust.isMulti
                      ? (choices[cust.id] || []).includes(opt)
                      : choices[cust.id] === opt

                    return (
                      <motion.button
                        key={opt}
                        onClick={() => setChoice(cust.id, opt, cust.isMulti)}
                        className={`px-5 py-3 rounded-xl border-2 text-base font-semibold transition-all shadow-sm ${
                          isSelected
                            ? 'border-[#4B7342] bg-[#4B7342] text-white shadow-lg'
                            : 'border-gray-200 bg-white hover:border-[#4B7342] hover:shadow-md'
                        }`}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isSelected && (
                          <svg className="w-4 h-4 inline mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {opt}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Quantity selector */}
            <div className="mb-8 bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-[#6B4E3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <h3 className="text-lg font-bold text-gray-800">Quantity</h3>
              </div>
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-14 h-14 rounded-xl border-2 border-gray-300 hover:border-[#4B7342] hover:bg-[#4B7342] hover:text-white bg-white flex items-center justify-center text-2xl font-bold transition-all shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  −
                </motion.button>
                <div className="text-3xl font-bold text-gray-900 w-20 text-center bg-white rounded-xl py-3 shadow-sm border-2 border-gray-200">{qty}</div>
                <motion.button
                  onClick={() => setQty(q => q + 1)}
                  className="w-14 h-14 rounded-xl border-2 border-gray-300 hover:border-[#4B7342] hover:bg-[#4B7342] hover:text-white bg-white flex items-center justify-center text-2xl font-bold transition-all shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  +
                </motion.button>
              </div>
            </div>

            {/* Total Price and Add button */}
            <div className="border-t-2 border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-semibold text-gray-600">Total Price</span>
                <motion.div
                  key={item.price * qty}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-4xl font-bold text-[#4B7342]"
                >
                  Rp {(item.price * qty).toLocaleString()}
                </motion.div>
              </div>
              <div className="flex gap-3">
                <motion.button
                  id="add-to-cart-btn"
                  onClick={handleAdd}
                  className="flex-1 bg-gradient-to-r from-[#4B7342] to-[#5a8850] text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </motion.button>
                <motion.button
                  onClick={() => navigate('/cart')}
                  className="px-6 py-4 rounded-xl border-2 border-[#4B7342] text-[#4B7342] font-bold hover:bg-[#4B7342] hover:text-white transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
