export default function Orders(){
  const orders = []
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Orders</h2>
      {!orders.length && <div className="bg-white p-4 rounded shadow">No orders yet (demo)</div>}
    </div>
  )
}
