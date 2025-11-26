import { useParams } from 'react-router-dom'
export default function OrderStatus(){
  const { orderId } = useParams()
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Order Status</h2>
      <div className="bg-white p-4 rounded shadow">
        <div>Order ID: <span className="font-mono">{orderId}</span></div>
        <div className="mt-3 text-gray-600">Status: Pending (demo)</div>
        <div className="mt-4">
          <div className="h-3 bg-gray-200 rounded overflow-hidden">
            <div className="h-full bg-yellow-400 w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
