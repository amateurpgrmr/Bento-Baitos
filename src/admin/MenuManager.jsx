import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function MenuManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Rice Bowls',
    image_url: '',
    stock: 0,
    low_stock_threshold: 5,
    is_featured: false,
    sort_order: 0
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/menu');
      setItems(response.data.items || []);
      setError(null);
    } catch (err) {
      setError('Failed to load menu items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        price: parseInt(formData.price),
        stock: parseInt(formData.stock) || 0,
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 5,
        sort_order: parseInt(formData.sort_order) || 0
      };

      if (editingItem) {
        await api.put(`/api/admin/menu/${editingItem.id}`, payload);
      } else {
        await api.post('/api/admin/menu', payload);
      }

      fetchMenuItems();
      resetForm();
      setShowAddModal(false);
      setEditingItem(null);
    } catch (err) {
      alert('Failed to save menu item: ' + err.message);
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await api.delete(`/api/admin/menu/${itemId}`);
      fetchMenuItems();
    } catch (err) {
      alert('Failed to delete item: ' + err.message);
    }
  };

  const handleToggleAvailability = async (itemId) => {
    try {
      await api.put(`/api/admin/menu/${itemId}/toggle`);
      fetchMenuItems();
    } catch (err) {
      alert('Failed to toggle availability: ' + err.message);
    }
  };

  const handleStockUpdate = async (itemId, operation, amount = 1) => {
    try {
      await api.put(`/api/admin/menu/${itemId}/stock`, {
        stock: amount,
        operation
      });
      fetchMenuItems();
    } catch (err) {
      alert('Failed to update stock: ' + err.message);
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      image_url: item.image_url || '',
      stock: item.stock,
      low_stock_threshold: item.low_stock_threshold,
      is_featured: item.is_featured === 1,
      sort_order: item.sort_order || 0
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Rice Bowls',
      image_url: '',
      stock: 0,
      low_stock_threshold: 5,
      is_featured: false,
      sort_order: 0
    });
    setEditingItem(null);
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">Menu Manager</h2>
        <div className="bg-white p-4 rounded shadow">Loading menu items...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">Menu Manager</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Menu Manager</h2>
          <p className="text-sm text-gray-600 mt-1">Manage menu items, stock, and availability</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="px-4 py-2 bg-[#4B7342] text-white rounded-lg hover:bg-[#3d5c35] flex items-center gap-2 font-medium shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Menu Item
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h3 className="text-xl font-bold">{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4B7342] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4B7342] focus:border-transparent"
                  >
                    <option value="Rice Bowls">Rice Bowls</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Specials">Specials</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Price (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4B7342] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="/image.jpeg"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4B7342] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Stock (0 = unlimited)</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4B7342] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Low Stock Alert</label>
                  <input
                    type="number"
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData({...formData, low_stock_threshold: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4B7342] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({...formData, sort_order: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4B7342] focus:border-transparent"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                    className="w-4 h-4 text-[#4B7342] focus:ring-[#4B7342] border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm font-medium">Featured Item</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4B7342] focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-[#4B7342] text-white px-4 py-2 rounded-lg hover:bg-[#3d5c35] font-medium"
                >
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Items Grid */}
      {!items.length ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-600">No menu items yet. Add your first item to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div key={item.id} className="p-6 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Item Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                        {item.is_featured === 1 && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">Featured</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">{item.category}</span>
                        <span className="text-lg font-bold text-[#4B7342]">Rp {item.price.toLocaleString()}</span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Stock:</span>
                      {item.stock === 0 && item.available === 1 ? (
                        <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">Unlimited</span>
                      ) : item.is_sold_out ? (
                        <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded font-medium">Sold Out</span>
                      ) : item.is_low_stock ? (
                        <span className="text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-medium">{item.stock} (Low)</span>
                      ) : (
                        <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded font-medium">{item.stock}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <span className={`text-sm px-2 py-1 rounded font-medium ${item.available === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {item.available === 1 ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 min-w-[200px]">
                  {/* Stock Controls */}
                  {item.stock > 0 && (
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                      <button
                        onClick={() => handleStockUpdate(item.id, 'subtract')}
                        className="p-1 bg-white border rounded hover:bg-gray-100"
                        title="Decrease stock"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="flex-1 text-center font-medium">{item.stock}</span>
                      <button
                        onClick={() => handleStockUpdate(item.id, 'add')}
                        className="p-1 bg-white border rounded hover:bg-gray-100"
                        title="Increase stock"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleAvailability(item.id)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${item.available === 1 ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                    >
                      {item.available === 1 ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => openEditModal(item)}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
                      title="Edit item"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
                      title="Delete item"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
