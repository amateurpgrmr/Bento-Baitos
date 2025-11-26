import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts'
import { api } from '../api/client'

// Sample data for demo
const SAMPLE_ITEMS = [
  { name: 'Curry Rice', sold: 42, revenue: 1638000 },
  { name: 'Iced Latte', sold: 35, revenue: 980000 },
  { name: 'Ham Sandwich', sold: 28, revenue: 980000 },
  { name: 'Blueberry Muffin', sold: 22, revenue: 484000 }
]

const SAMPLE_STATUS = [
  { name: 'Completed', value: 85, color: '#4B7342' },
  { name: 'Preparing', value: 12, color: '#F59E0B' },
  { name: 'Pending', value: 8, color: '#EF4444' }
]

const SAMPLE_WEEKLY = [
  { day: 'Mon', orders: 15, revenue: 525000 },
  { day: 'Tue', orders: 22, revenue: 770000 },
  { day: 'Wed', orders: 18, revenue: 630000 },
  { day: 'Thu', orders: 25, revenue: 875000 },
  { day: 'Fri', orders: 32, revenue: 1120000 },
  { day: 'Sat', orders: 38, revenue: 1330000 },
  { day: 'Sun', orders: 28, revenue: 980000 }
]

export default function Stats(){
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats(){
    try {
      const response = await api.get('/api/admin/stats')
      setStats(response.data)
    } catch(error) {
      console.log('Using sample data (API not available)')
      // Use sample data if API is not available
      setStats({
        items: SAMPLE_ITEMS,
        ordersByStatus: SAMPLE_STATUS,
        weekly: SAMPLE_WEEKLY
      })
    } finally {
      setLoading(false)
    }
  }

  if(loading){
    return <div className="text-center py-12">Loading statistics...</div>
  }

  const items = stats?.items || SAMPLE_ITEMS
  const statusData = stats?.ordersByStatus || SAMPLE_STATUS
  const weeklyData = stats?.weekly || SAMPLE_WEEKLY

  return (
    <div>
      <h2 className="text-3xl font-bold text-[#6B4E3D] mb-6">Sales Analytics</h2>

      <div className="space-y-6">
        {/* Top Selling Items - Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-xl font-semibold text-[#6B4E3D] mb-4">Top Selling Items</h3>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={items}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                  formatter={(value, name) => [value, name === 'sold' ? 'Items Sold' : 'Revenue']}
                />
                <Legend />
                <Bar dataKey="sold" fill="#4B7342" radius={[8, 8, 0, 0]} name="Items Sold" />
                <Bar dataKey="revenue" fill="#7A5737" radius={[8, 8, 0, 0]} name="Revenue (Rp)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Status Distribution - Pie Chart */}
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
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Orders Trend - Line Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-xl font-semibold text-[#6B4E3D] mb-4">Weekly Trends</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#4B7342" strokeWidth={3} dot={{ r: 5 }} name="Orders" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#7A5737" strokeWidth={3} dot={{ r: 5 }} name="Revenue (Rp)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-sm text-gray-600 mb-1">Total Items Sold</div>
            <div className="text-3xl font-bold text-[#6B4E3D]">
              {items.reduce((sum, item) => sum + item.sold, 0)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-3xl font-bold text-[#6B4E3D]">
              Rp {items.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-sm text-gray-600 mb-1">Average Order Value</div>
            <div className="text-3xl font-bold text-[#6B4E3D]">
              Rp {Math.round(items.reduce((sum, item) => sum + item.revenue, 0) / statusData.reduce((sum, s) => sum + s.value, 0)).toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-sm text-gray-600 mb-1">Most Popular</div>
            <div className="text-2xl font-bold text-[#6B4E3D]">
              {items[0]?.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
