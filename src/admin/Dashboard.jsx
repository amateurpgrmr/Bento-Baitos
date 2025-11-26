export default function Dashboard(){
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Today's revenue</div>
          <div className="text-xl font-bold">Rp 0</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Orders</div>
          <div className="text-xl font-bold">0</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Popular item</div>
          <div className="text-xl font-bold">—</div>
        </div>
      </div>
    </div>
  )
}
