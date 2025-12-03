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

  const handleVerifyPayment = async (orderId) => {
    try {
      await api.put(`/api/admin/orders/${orderId}/verify-payment`);
      fetchOrders();
    } catch (err) {
      alert('Failed to verify payment: ' + err.message);
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

  const exportToCSV = () => {
    // Prepare CSV data
    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Items', 'Total (Rp)', 'Payment Method', 'Status'];
    const rows = orders.map(order => {
      const itemsStr = order.items?.map(item => `${item.quantity}x ${item.item_name}`).join('; ') || '';
      return [
        order.order_uid || order.id,
        new Date(order.created_at).toLocaleString(),
        order.customer_name || '',
        order.phone || '',
        itemsStr,
        order.total_price,
        order.payment_method || '',
        order.status
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            disabled={orders.length === 0}
            className={`px-4 py-2 rounded flex items-center gap-2 font-medium transition-colors ${
              orders.length === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#4B7342] text-white hover:bg-[#3d5c35]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
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
      </div>

      {!orders.length ? (
        <div className="bg-white p-4 rounded shadow">No orders found</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <div key={order.id} className="bg-white p-6 rounded shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Order #{index + 1}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>
                  {!order.payment_proof_url && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      NO PROOF
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Customer Information
                </h4>
                <p className="text-base font-bold text-gray-900 mb-1">{order.customer_name || 'N/A'}</p>
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {order.phone || 'N/A'}
                </p>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-3 text-gray-700">Order Items:</h4>
                {order.items && order.items.length > 0 ? (
                  <ul className="space-y-3">
                    {order.items.map((item, idx) => {
                      let customizationsDisplay = '';
                      if (item.customizations) {
                        try {
                          const customs = typeof item.customizations === 'string'
                            ? JSON.parse(item.customizations)
                            : item.customizations;

                          const customArray = Object.entries(customs)
                            .map(([key, value]) => {
                              if (Array.isArray(value)) {
                                return value.length > 0 ? value.join(', ') : null;
                              }
                              return value;
                            })
                            .filter(Boolean);

                          customizationsDisplay = customArray.length > 0 ? customArray.join(' • ') : '';
                        } catch (e) {
                          customizationsDisplay = '';
                        }
                      }

                      return (
                        <li key={idx} className="bg-gray-50 p-3 rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-semibold text-gray-800">{item.quantity}x {item.item_name}</span>
                              {customizationsDisplay && (
                                <div className="text-xs text-gray-600 mt-1 ml-1">
                                  + {customizationsDisplay}
                                </div>
                              )}
                            </div>
                            <span className="text-gray-700 font-medium">Rp {item.unit_price.toLocaleString()}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No items</p>
                )}
              </div>

              <div className="mb-4 border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base font-semibold text-gray-700">Total Amount:</span>
                  <span className="text-2xl font-bold text-[#4B7342]">Rp {order.total_price.toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600">
                  Payment Method: <span className="font-medium">{order.payment_method === 'bank_transfer' ? 'Bank Transfer' : order.payment_method || 'N/A'}</span>
                </p>
                {order.payment_proof_url && (
                  <a
                    href={order.payment_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 mt-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Payment Proof
                  </a>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
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

                {order.payment_proof_url && !order.payment_verified && (
                  <button
                    onClick={() => handleVerifyPayment(order.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Payment Verified
                  </button>
                )}

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
