'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Modal states
  const [categoryModal, setCategoryModal] = useState({ open: false, editing: null });
  const [itemModal, setItemModal] = useState({ open: false, editing: null, categoryId: null });
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [itemForm, setItemForm] = useState({
    name: '',
    price: '',
    category_id: '',
    available: true,
    image_base64: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMenu();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadMenu = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data.categories || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Category CRUD ---
  const openAddCategory = () => {
    setCategoryForm({ name: '' });
    setCategoryModal({ open: true, editing: null });
  };

  const openEditCategory = (cat) => {
    setCategoryForm({ name: cat.name });
    setCategoryModal({ open: true, editing: cat });
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (categoryModal.editing) {
        await api.updateCategory(categoryModal.editing._id || categoryModal.editing.id, categoryForm);
        showToast('Category updated successfully');
      } else {
        await api.createCategory(categoryForm);
        showToast('Category created successfully');
      }
      setCategoryModal({ open: false, editing: null });
      loadMenu();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!confirm(`Delete category "${cat.name}" and all its items?`)) return;
    try {
      await api.deleteCategory(cat._id || cat.id);
      showToast('Category deleted');
      loadMenu();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // --- Item CRUD ---
  const openAddItem = (categoryId) => {
    setItemForm({ name: '', price: '', category_id: categoryId, available: true, image_base64: '' });
    setItemModal({ open: true, editing: null, categoryId });
  };

  const openEditItem = (item) => {
    setItemForm({
      name: item.name,
      price: item.price?.toString() || '',
      category_id: item.category_id || item.category,
      available: item.available !== false,
      image_base64: ''
    });
    setItemModal({ open: true, editing: item, categoryId: item.category_id || item.category });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemForm({ ...itemForm, image_base64: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...itemForm,
      price: parseFloat(itemForm.price),
    };
    try {
      if (itemModal.editing) {
        await api.updateItem(itemModal.editing._id || itemModal.editing.id, payload);
        showToast('Item updated successfully');
      } else {
        await api.createItem(payload);
        showToast('Item added successfully');
      }
      setItemModal({ open: false, editing: null, categoryId: null });
      loadMenu();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await api.deleteItem(item._id || item.id);
      showToast('Item deleted');
      loadMenu();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await api.updateItem(item._id || item.id, {
        available: !item.available,
      });
      loadMenu();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {categories.length} categories
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddCategory}>
          + Add Category
        </button>
      </div>

      {error && (
        <div className="auth-error" style={{ marginBottom: '20px' }}>{error}</div>
      )}

      {/* Categories & Items */}
      {categories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🍽️</div>
          <div className="empty-state-title">No menu categories yet</div>
          <div className="empty-state-desc">Create a category to start adding menu items</div>
        </div>
      ) : (
        <div className="menu-categories">
          {categories.map((cat) => (
            <div key={cat._id || cat.id} className="menu-category animate-fade-in">
              <div className="menu-category-header">
                <h3 className="menu-category-title">{cat.name}</h3>
                <div className="menu-category-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => openAddItem(cat._id || cat.id)}>
                    + Add Item
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEditCategory(cat)}>
                    ✏️
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteCategory(cat)}>
                    🗑️
                  </button>
                </div>
              </div>

              {(!cat.items || cat.items.length === 0) ? (
                <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', padding: '20px 0', textAlign: 'center' }}>
                  No items in this category. Add one!
                </p>
              ) : (
                <div className="menu-items-grid">
                  {cat.items.map((item) => (
                    <div
                      key={item._id || item.id}
                      className={`menu-item-card ${item.available === false ? 'unavailable' : ''}`}
                      style={{ overflow: 'hidden' }}
                    >
                      {item.image_url && (
                        <div style={{ height: '140px', margin: '-20px -20px 15px -20px', overflow: 'hidden' }}>
                          <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div className="menu-item-name">{item.name}</div>
                      <div className="menu-item-price">
                        {new Intl.NumberFormat().format(item.price)}
                      </div>
                      <div className="menu-item-footer">
                        <div className="menu-item-toggle">
                          <div
                            className={`toggle-switch ${item.available !== false ? 'active' : ''}`}
                            onClick={() => handleToggleAvailability(item)}
                          ></div>
                          <span>{item.available !== false ? 'Available' : 'Unavailable'}</span>
                        </div>
                        <div className="table-actions">
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEditItem(item)}>
                            ✏️
                          </button>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleDeleteItem(item)}>
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      {categoryModal.open && (
        <div className="modal-overlay" onClick={() => setCategoryModal({ open: false, editing: null })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {categoryModal.editing ? 'Edit Category' : 'New Category'}
              </h2>
              <button
                className="modal-close"
                onClick={() => setCategoryModal({ open: false, editing: null })}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveCategory}>
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Main Dishes, Drinks..."
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setCategoryModal({ open: false, editing: null })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : categoryModal.editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {itemModal.open && (
        <div className="modal-overlay" onClick={() => setItemModal({ open: false, editing: null, categoryId: null })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {itemModal.editing ? 'Edit Item' : 'New Menu Item'}
              </h2>
              <button
                className="modal-close"
                onClick={() => setItemModal({ open: false, editing: null, categoryId: null })}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveItem}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Margherita Pizza"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  required
                  min="0"
                  step="any"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Item Image (Media Server)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-input"
                  onChange={handleImageUpload}
                />
                {itemForm.image_base64 && (
                  <img src={itemForm.image_base64} alt="Preview" style={{ marginTop: '10px', height: '100px', borderRadius: '8px', objectFit: 'cover' }} />
                )}
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setItemModal({ open: false, editing: null, categoryId: null })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : itemModal.editing ? 'Update' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
