import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchComponents, fetchCategories } from '../store/slices/componentSlice';
import { fetchPricePreview, createConfiguration, clearPreview } from '../store/slices/configSlice';
import PriceBreakdown from '../components/PriceBreakdown';

export default function ConfigBuilder() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: components, categories } = useSelector((s) => s.components);
  const { preview, status, error } = useSelector((s) => s.configurations);

  const [selected, setSelected] = useState({}); // { category: componentId }
  const [configName, setConfigName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchComponents({ active: 'true' }));
    dispatch(clearPreview());
  }, [dispatch]);

  const selectedIds = useMemo(() => Object.values(selected).filter(Boolean), [selected]);

  useEffect(() => {
    if (selectedIds.length > 0) {
      dispatch(fetchPricePreview(selectedIds));
    } else {
      dispatch(clearPreview());
    }
  }, [selectedIds, dispatch]);

  const componentsByCategory = (category) => components.filter((c) => c.category === category);

  const handleSelect = (category, componentId) => {
    setSelected((prev) => ({ ...prev, [category]: componentId || undefined }));
  };

  const handleRemove = (componentId) => {
    setSelected((prev) => {
      const next = { ...prev };
      const cat = Object.keys(next).find((k) => next[k] === componentId);
      if (cat) delete next[cat];
      return next;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError('');
    if (!configName.trim()) {
      setSaveError('Please give this configuration a name.');
      return;
    }
    if (selectedIds.length === 0) {
      setSaveError('Select at least one component before saving.');
      return;
    }
    const action = await dispatch(
      createConfiguration({
        configName,
        customerName,
        customerEmail,
        notes,
        componentIds: selectedIds,
      })
    );
    if (action.error) {
      setSaveError(action.payload || 'Failed to save configuration.');
      return;
    }
    setSaved(true);
    setTimeout(() => navigate(`/configurations/${action.payload._id}`), 900);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Build a Laptop Configuration</h1>
        <p className="text-slate-500 text-sm">Pick one component per category — pricing updates automatically.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-4 grid sm:grid-cols-2 gap-2">
            {categories.map((category) => {
              const options = componentsByCategory(category);
              return (
                <div key={category}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{category}</label>
                  <select
                    className="input-field"
                    value={selected[category] || ''}
                    onChange={(e) => handleSelect(category, e.target.value)}
                  >
                    <option value="">— None —</option>
                    {options.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} {c.brand ? `(${c.brand})` : ''} — ₹{c.price.toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          <PriceBreakdown items={preview.items} total={preview.totalPrice} onRemove={handleRemove} />
        </div>

        <div className="card p-4 h-fit space-y-3">
          <h3 className="font-semibold text-slate-800">Save Configuration</h3>
          {saveError && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{saveError}</div>}
          {saved && <div className="bg-green-50 text-green-600 text-sm px-3 py-2 rounded-lg">Saved! Redirecting…</div>}

          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Configuration Name *</label>
              <input
                className="input-field"
                placeholder="e.g. Business Ultrabook - Acme Corp"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Customer Name</label>
              <input className="input-field" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Customer Email</label>
              <input
                type="email"
                className="input-field"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
              <textarea className="input-field" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                <span>Components selected</span>
                <span>{selectedIds.length}</span>
              </div>
              <div className="flex items-center justify-between font-semibold text-slate-800 mb-3">
                <span>Total</span>
                <span className="text-brand-700 text-lg">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
                    preview.totalPrice
                  )}
                </span>
              </div>
              <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
                Save Configuration
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
