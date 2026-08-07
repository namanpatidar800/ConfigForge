import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Eye, Trash2, X } from 'lucide-react';
import { fetchConfigurations, deleteConfiguration } from '../store/slices/configSlice';
import { currency } from '../components/PriceBreakdown';

export default function ConfigList() {
  const dispatch = useDispatch();
  const { list, pagination, status } = useSelector((s) => s.configurations);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState(null); // { id, name } | null
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const params = { page, limit: 10 };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    const timeout = setTimeout(() => dispatch(fetchConfigurations(params)), 250);
    return () => clearTimeout(timeout);
  }, [dispatch, search, statusFilter, page]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    await dispatch(deleteConfiguration(pendingDelete.id));
    setDeleting(false);
    setPendingDelete(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Saved Configurations</h1>
          <p className="text-slate-500 text-sm">Search, review, and manage every quotation ever created.</p>
        </div>
        <Link to="/configurations/new" className="btn-primary self-start">
          + New Configuration
        </Link>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <input
          className="input-field sm:max-w-xs"
          placeholder="Search by name, customer, email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="input-field sm:max-w-xs"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="finalized">Finalized</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-2 font-medium">Config Name</th>
                <th className="px-4 py-2 font-medium hidden md:table-cell">Customer</th>
                <th className="px-4 py-2 font-medium hidden lg:table-cell">Created</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium text-right">Total</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {status === 'loading' ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Loading…
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No configurations found.
                  </td>
                </tr>
              ) : (
                list.map((c) => (
                  <tr key={c._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-2">
                      <Link to={`/configurations/${c._id}`} className="text-slate-800 font-medium hover:text-brand-600">
                        {c.configName}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-slate-500 hidden md:table-cell">{c.customerName || '—'}</td>
                    <td className="px-4 py-2 text-slate-500 hidden lg:table-cell">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          c.status === 'finalized' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-slate-800">{currency(c.totalPrice)}</td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/configurations/${c._id}`}
                          title="View configuration"
                          className="inline-flex items-center gap-1 text-brand-600 text-xs font-medium px-2 py-1 rounded-md transition-colors hover:bg-brand-50"
                        >
                          <Eye size={13} /> View
                        </Link>
                        <button
                          onClick={() => setPendingDelete({ id: c._id, name: c.configName })}
                          title="Delete configuration"
                          className="inline-flex items-center gap-1 text-red-500 text-xs font-medium px-2 py-1 rounded-md transition-colors hover:bg-red-50"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            className="btn-secondary text-sm py-1.5 px-3"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            className="btn-secondary text-sm py-1.5 px-3"
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
          >
            Next
          </button>
        </div>
      )}

      {pendingDelete && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-20"
          onClick={() => !deleting && setPendingDelete(null)}
        >
          <div className="card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <h2 className="font-semibold text-lg text-slate-800">Delete configuration?</h2>
              <button
                onClick={() => !deleting && setPendingDelete(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-5">
              This will permanently delete <span className="font-medium text-slate-700">"{pendingDelete.name}"</span>.
              This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="btn-danger flex-1 justify-center py-2"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
              <button
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
