import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Orders(){
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await api.get('/api/admin/orders', { params });
      setOrders(response.data.orders || []);
      setError(null);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      await api.put(`/api/admin/orders/${orderId}/status`, { status: 'completed' });
      // Refresh orders after updating
      fetchOrders();
    } catch (err) {
      alert('Failed to complete order: ' + err.message);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">Orders</h2>
        <div className="bg-white p-4 rounded shadow">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">Orders</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Orders ({orders.length})</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {!orders.length ? (
        <div className="bg-white p-4 rounded shadow">No orders found</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">{order.order_uid}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(order.status)}`}>
                  {order.status.toUpperCase()}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium">Customer: {order.user_name || 'N/A'}</p>
                <p className="text-sm text-gray-600">Phone: {order.user_phone || 'N/A'}</p>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Items:</h4>
                {order.items && order.items.length > 0 ? (
                  <ul className="space-y-2">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="text-sm">
                        <span className="font-medium">{item.quantity}x {item.item_name}</span>
                        <span className="text-gray-600"> - Rp {(item.unit_price / 100).toLocaleString()}</span>
                        {item.customizations && (
                          <span className="text-gray-500 text-xs block ml-4">
                            {item.customizations}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No items</p>
                )}
              </div>

              <div className="mb-4">
                <p className="text-lg font-bold">
                  Total: Rp {(order.total_price / 100).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Payment: {order.payment_method || 'N/A'}
                </p>
                {order.payment_proof_url && (
                  <a
                    href={order.payment_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Payment Proof
                  </a>
                )}
              </div>

              <div className="flex gap-2">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="px-4 py-2 border rounded text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {order.status !== 'completed' && order.status !== 'cancelled' && (
                  <button
                    onClick={() => handleCompleteOrder(order.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                  >
                    Mark as Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
