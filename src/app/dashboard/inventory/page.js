'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('inventory');
  
  // Inventory state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ item_name: '', quantity: '', unit: 'kg', min_threshold: '' });

  // Recipe state
  const [categories, setCategories] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [recipeFormData, setRecipeFormData] = useState({ inventory_id: '', quantity_required: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invData, catData] = await Promise.all([
        api.getInventory(),
        api.getCategories()
      ]);
      setItems(invData);
      setCategories(catData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInventory = async (e) => {
    e.preventDefault();
    try {
      await api.createInventory({
        item_name: formData.item_name,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        min_threshold: parseFloat(formData.min_threshold || 0)
      });
      setShowModal(false);
      setFormData({ item_name: '', quantity: '', unit: 'kg', min_threshold: '' });
      loadData();
    } catch (err) {
      alert('Xatolik: ' + err.message);
    }
  };

  const handleSelectMenuItem = async (menuItem) => {
    setSelectedMenuItem(menuItem);
    try {
      setRecipeLoading(true);
      const data = await api.getRecipes(menuItem.id || menuItem._id);
      setRecipeIngredients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRecipeLoading(false);
    }
  };

  const handleAddRecipeIngredient = (e) => {
    e.preventDefault();
    if (!recipeFormData.inventory_id || !recipeFormData.quantity_required) return;
    
    // Check if already added
    if (recipeIngredients.some(r => r.inventory_id.toString() === recipeFormData.inventory_id.toString())) {
      alert('Bu mahsulot allaqachon qo\'shilgan!');
      return;
    }

    const invItem = items.find(i => i.id.toString() === recipeFormData.inventory_id.toString());
    
    const newIngredient = {
      inventory_id: recipeFormData.inventory_id,
      quantity_required: parseFloat(recipeFormData.quantity_required),
      item_name: invItem?.item_name,
      unit: invItem?.unit
    };
    
    setRecipeIngredients([...recipeIngredients, newIngredient]);
    setShowRecipeModal(false);
    setRecipeFormData({ inventory_id: '', quantity_required: '' });
  };

  const handleRemoveRecipeIngredient = (inventoryId) => {
    setRecipeIngredients(recipeIngredients.filter(r => r.inventory_id.toString() !== inventoryId.toString()));
  };

  const handleSaveRecipe = async () => {
    try {
      setRecipeLoading(true);
      const payload = recipeIngredients.map(r => ({
        inventory_id: r.inventory_id,
        quantity_required: r.quantity_required
      }));
      await api.saveRecipe(selectedMenuItem.id || selectedMenuItem._id, payload);
      alert('Retsept muvaffaqiyatli saqlandi!');
    } catch (err) {
      alert('Xatolik: ' + err.message);
    } finally {
      setRecipeLoading(false);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div className="dashboard-card animate-fade-in">
      <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px', paddingBottom: '10px' }}>
        <button 
          onClick={() => setActiveTab('inventory')}
          style={{ 
            background: 'none', border: 'none', fontSize: '18px', fontWeight: '600', cursor: 'pointer',
            color: activeTab === 'inventory' ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'inventory' ? '2px solid var(--primary-color)' : 'none',
            paddingBottom: '5px'
          }}
        >
          Ombor Qoldiqlari
        </button>
        <button 
          onClick={() => setActiveTab('recipes')}
          style={{ 
            background: 'none', border: 'none', fontSize: '18px', fontWeight: '600', cursor: 'pointer',
            color: activeTab === 'recipes' ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'recipes' ? '2px solid var(--primary-color)' : 'none',
            paddingBottom: '5px'
          }}
        >
          Taomlar Retsepti
        </button>
      </div>

      {activeTab === 'inventory' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Maxsulot Qo'shish</button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Mahsulot nomi</th>
                  <th>Qoldiq</th>
                  <th>O'lchov</th>
                  <th>Holat</th>
                  <th>Oxirgi yangilanish</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                      Ombor bo'sh. Mahsulot qo'shing.
                    </td>
                  </tr>
                ) : (
                  items.map(item => {
                    const isLow = parseFloat(item.quantity) <= parseFloat(item.min_threshold);
                    return (
                      <tr key={item.id}>
                        <td style={{ fontWeight: '500' }}>{item.item_name}</td>
                        <td style={{ fontWeight: 'bold', color: isLow ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                          {item.quantity}
                        </td>
                        <td>{item.unit}</td>
                        <td>
                          {isLow ? (
                            <span className="badge badge-cancelled">Tugamoqda!</span>
                          ) : (
                            <span className="badge badge-paid">Yetarli</span>
                          )}
                        </td>
                        <td>{new Date(item.last_updated).toLocaleString()}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '400px' }}>
                <h3 style={{ marginBottom: '20px' }}>Yangi mahsulot</h3>
                <form onSubmit={handleCreateInventory}>
                  <div className="auth-form-group">
                    <label>Nomi (Masalan: Un, Go'sht)</label>
                    <input type="text" className="auth-input" required value={formData.item_name} onChange={(e) => setFormData({...formData, item_name: e.target.value})} />
                  </div>
                  <div className="auth-form-group">
                    <label>Miqdori / Qoldiq</label>
                    <input type="number" step="0.01" className="auth-input" required value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
                  </div>
                  <div className="auth-form-group">
                    <label>O'lchov birligi</label>
                    <select className="auth-input" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})}>
                      <option value="kg">Kilogramm (kg)</option>
                      <option value="l">Litr (l)</option>
                      <option value="dona">Dona</option>
                      <option value="gr">Gramm (gr)</option>
                    </select>
                  </div>
                  <div className="auth-form-group">
                    <label>Minimal chegara (Shundan kamaysa ogohlantiradi)</label>
                    <input type="number" step="0.01" className="auth-input" value={formData.min_threshold} onChange={(e) => setFormData({...formData, min_threshold: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Bekor qilish</button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Saqlash</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'recipes' && (
        <div style={{ display: 'flex', gap: '30px', minHeight: '500px' }}>
          {/* Menu Items List */}
          <div style={{ flex: '1', borderRight: '1px solid var(--border-color)', paddingRight: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>Menyu</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {categories.map(cat => (
                <div key={cat.id || cat._id}>
                  <div style={{ fontWeight: 'bold', padding: '5px 0', color: 'var(--text-secondary)' }}>{cat.name}</div>
                  {cat.items && cat.items.map(item => (
                    <button
                      key={item.id || item._id}
                      onClick={() => handleSelectMenuItem(item)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        background: selectedMenuItem && (selectedMenuItem.id === item.id || selectedMenuItem._id === item._id) ? 'var(--primary-color)' : 'transparent',
                        color: selectedMenuItem && (selectedMenuItem.id === item.id || selectedMenuItem._id === item._id) ? 'white' : 'var(--text-primary)',
                        cursor: 'pointer',
                        marginBottom: '5px'
                      }}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Recipe Editor */}
          <div style={{ flex: '2' }}>
            {selectedMenuItem ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3>{selectedMenuItem.name} - Tarkibi</h3>
                  <button className="btn btn-primary" onClick={() => setShowRecipeModal(true)}>+ Maxsulot Qo'shish</button>
                </div>

                {recipeLoading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    {recipeIngredients.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)' }}>Ushbu taom uchun retsept kiritilmagan. Buyurtma berilganda ombordan hech narsa ayirilmaydi.</p>
                    ) : (
                      <div className="table-container" style={{ marginBottom: '20px' }}>
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Mahsulot</th>
                              <th>Sarflanishi (1 ta porsiya uchun)</th>
                              <th>O'lchov</th>
                              <th>Amallar</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recipeIngredients.map((ing, idx) => (
                              <tr key={idx}>
                                <td>{ing.item_name}</td>
                                <td style={{ fontWeight: 'bold' }}>{ing.quantity_required}</td>
                                <td>{ing.unit}</td>
                                <td>
                                  <button 
                                    className="btn btn-secondary" 
                                    style={{ padding: '5px 10px', background: 'var(--accent-red)', color: 'white', border: 'none' }}
                                    onClick={() => handleRemoveRecipeIngredient(ing.inventory_id)}
                                  >
                                    O'chirish
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    <button className="btn btn-primary" style={{ width: '100%', padding: '12px' }} onClick={handleSaveRecipe}>
                      O'zgarishlarni Saqlash
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                Retsept yaratish yoki tahrirlash uchun chap tomondan taomni tanlang
              </div>
            )}
          </div>

          {/* Add Recipe Ingredient Modal */}
          {showRecipeModal && (
            <div className="modal-overlay">
              <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '400px' }}>
                <h3 style={{ marginBottom: '20px' }}>Tarkibga mahsulot qo'shish</h3>
                <form onSubmit={handleAddRecipeIngredient}>
                  <div className="auth-form-group">
                    <label>Ombordagi maxsulotni tanlang</label>
                    <select 
                      className="auth-input" 
                      required 
                      value={recipeFormData.inventory_id} 
                      onChange={(e) => setRecipeFormData({...recipeFormData, inventory_id: e.target.value})}
                    >
                      <option value="">-- Tanlang --</option>
                      {items.map(item => (
                        <option key={item.id} value={item.id}>{item.item_name} (Qoldiq: {item.quantity} {item.unit})</option>
                      ))}
                    </select>
                  </div>
                  <div className="auth-form-group">
                    <label>1 ta porsiya uchun sarflanishi</label>
                    <input 
                      type="number" 
                      step="0.001" 
                      className="auth-input" 
                      required 
                      value={recipeFormData.quantity_required} 
                      onChange={(e) => setRecipeFormData({...recipeFormData, quantity_required: e.target.value})} 
                      placeholder="Masalan: 0.2"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowRecipeModal(false)}>Bekor qilish</button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Qo'shish</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
