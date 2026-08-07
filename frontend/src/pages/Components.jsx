import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Pencil, PowerOff, Power } from 'lucide-react';
import {
  fetchComponents,
  fetchCategories,
  createComponent,
  updateComponent,
  deleteComponent,
} from '../store/slices/componentSlice';
import { currency } from '../components/PriceBreakdown';

const emptyForm = { category: '', name: '', brand: '', specs: '', sku: '', price: '' };

export default function Components() {
  const dispatch = useDispatch();
  const { list, categories, status } = useSelector((s) => s.components);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (categoryFilter) params.category = categoryFilter;
    if (!showInactive) params.active = 'true';
    const timeout = setTimeout(() => dispatch(fetchComponents(params)), 250);
    return () => clearTimeout(timeout);
  }, [dispatch, search, categoryFilter, showInactive]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (component) => {
    setEditingId(component._id);
    setForm({
      category: component.category,
      name: component.name,
      brand: component.brand || '',
      specs: component.specs || '',
      sku: component.sku || '',
      price: component.price,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.category || !form.name || form.price === '') {
      setFormError('Category, name and price are required.');
      return;
    }
    const payload = { ...form, price: Number(form.price) };
    const action = editingId
      ? await dispatch(updateComponent({ id: editingId, payload }))
      : await dispatch(createComponent(payload));

    if (action.error) {
      setFormError(action.payload || 'Something went wrong.');
      return;
    }
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this component? It will be hidden from new configurations but past quotes keep their price.')) return;
    await dispatch(deleteComponent(id));
  };

  const handleActivate = async (component) => {
    await dispatch(
      updateComponent({
        id: component._id,
        payload: { isActive: true, note: 'Reactivated' },
      })
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Components</h1>
          <p className="text-slate-500 text-sm">Manage processors, RAM, storage, and every other configurable part.</p>
        </div>
        <button onClick={openCreate} className="btn-primary self-start">
          + Add Component
        </button>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <input
          className="input-field sm:max-w-xs"
          placeholder="Search by name, brand, SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input-field sm:max-w-xs" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-600 whitespace-nowrap">
          <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
          Show deactivated
        </label>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-2 font-medium">Category</th>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium hidden md:table-cell">Specs</th>
                <th className="px-4 py-2 font-medium hidden lg:table-cell">SKU</th>
                <th className="px-4 py-2 font-medium text-right">Price</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {status === 'loading' ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Loading…
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No components found.
                  </td>
                </tr>
              ) : (
                list.map((c) => (
                  <tr key={c._id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-2">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-medium">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-800">
                      {c.name}
                      {c.brand ? <span className="text-slate-400"> · {c.brand}</span> : null}
                    </td>
                    <td className="px-4 py-2 text-slate-500 hidden md:table-cell">{c.specs}</td>
                    <td className="px-4 py-2 text-slate-500 hidden lg:table-cell">{c.sku}</td>
                    <td className="px-4 py-2 text-right font-medium text-slate-800">{currency(c.price)}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          c.isActive ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(c)}
                          title="Edit component"
                          className="inline-flex items-center gap-1 text-brand-600 text-xs font-medium px-2 py-1 rounded-md transition-colors hover:bg-brand-50"
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        {c.isActive ? (
                          <button
                            onClick={() => handleDelete(c._id)}
                            title="Deactivate component"
                            className="inline-flex items-center gap-1 text-red-500 text-xs font-medium px-2 py-1 rounded-md transition-colors hover:bg-red-50"
                          >
                            <PowerOff size={13} /> Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(c)}
                            title="Activate component"
                            className="inline-flex items-center gap-1 text-green-600 text-xs font-medium px-2 py-1 rounded-md transition-colors hover:bg-green-50"
                          >
                            <Power size={13} /> Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-20" onClick={() => setShowForm(false)}>
          <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold text-lg text-slate-800 mb-4">{editingId ? 'Edit Component' : 'Add Component'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              {formError && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{formError}</div>}

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                <select
                  className="input-field"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Select category…</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Brand</label>
                  <input className="input-field" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">SKU</label>
                  <input className="input-field" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Specs</label>
                <input className="input-field" value={form.specs} onChange={(e) => setForm({ ...form, specs: e.target.value })} />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
                {editingId && (
                  <p className="text-xs text-slate-400 mt-1">
                    Changing the price archives the old price in this component's history and does not affect past quotations.
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingId ? 'Save Changes' : 'Create Component'}
                </button>
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
