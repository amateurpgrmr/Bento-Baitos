import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts'
import { api } from '../api/client'

export default function Stats(){
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats(){
    try {
      const response = await api.get('/api/admin/stats')
      setStats(response.data)
      setError(null)
    } catch(error) {
      console.error('Failed to load stats:', error)
      setError('Failed to load statistics. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if(loading){
    return <div className="text-center py-12">Loading statistics...</div>
  }

  if(error){
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg inline-block">
          {error}
        </div>
      </div>
    )
  }

  const items = stats?.topItems || []
  const statusData = stats?.ordersByStatus || []
  const totalOrders = stats?.totalOrders || 0
  const totalRevenue = stats?.totalRevenue || 0

  // Show empty state if no orders
  if (totalOrders === 0) {
    return (
      <div>
        <h2 className="text-3xl font-bold text-[#6B4E3D] mb-6">Sales Analytics</h2>
        <div className="text-center py-16 bg-white rounded-2xl shadow-md">
          <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Sales Data Yet</h3>
          <p className="text-gray-500">Start taking orders to see analytics here!</p>
        </div>
      </div>
    )
  }

  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  return (
    <div>
      <h2 className="text-3xl font-bold text-[#6B4E3D] mb-6">Sales Analytics</h2>

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-sm text-gray-600 mb-1">Total Orders</div>
            <div className="text-3xl font-bold text-[#6B4E3D]">
              {totalOrders}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-3xl font-bold text-[#6B4E3D]">
              Rp {totalRevenue.toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-sm text-gray-600 mb-1">Average Order Value</div>
            <div className="text-3xl font-bold text-[#6B4E3D]">
              Rp {averageOrderValue.toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-sm text-gray-600 mb-1">Most Popular</div>
            <div className="text-2xl font-bold text-[#6B4E3D]">
              {items[0]?.item_name || '—'}
            </div>
          </div>
        </div>

        {/* Top Selling Items - Bar Chart */}
        {items.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-xl font-semibold text-[#6B4E3D] mb-4">Top Selling Items</h3>
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <BarChart data={items}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="item_name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="quantity_sold" fill="#4B7342" radius={[8, 8, 0, 0]} name="Items Sold" />
                  <Bar dataKey="order_count" fill="#7A5737" radius={[8, 8, 0, 0]} name="Order Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Order Status Distribution - Pie Chart */}
        {statusData.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-xl font-semibold text-[#6B4E3D] mb-4">Order Status Distribution</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {statusData.map((entry, index) => {
                      const colors = {
                        pending: '#EF4444',
                        paid: '#3B82F6',
                        preparing: '#F59E0B',
                        ready: '#10B981',
                        completed: '#4B7342',
                        cancelled: '#6B7280'
                      }
                      return <Cell key={`cell-${index}`} fill={colors[entry.status] || '#6B7280'} />
                    })}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
