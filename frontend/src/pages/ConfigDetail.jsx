import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchConfigurationById, deleteConfiguration, clearCurrentConfiguration } from '../store/slices/configSlice';
import PriceBreakdown, { currency } from '../components/PriceBreakdown';

export default function ConfigDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current } = useSelector((s) => s.configurations);

  useEffect(() => {
    dispatch(fetchConfigurationById(id));
    return () => dispatch(clearCurrentConfiguration());
  }, [dispatch, id]);

  if (!current) {
    return <p className="text-slate-400 text-center py-10">Loading configuration…</p>;
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete configuration "${current.configName}"? This cannot be undone.`)) return;
    await dispatch(deleteConfiguration(id));
    navigate('/configurations');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Link to="/configurations" className="text-sm text-brand-600 hover:underline">
            ← Back to configurations
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">{current.configName}</h1>
          <p className="text-slate-500 text-sm">
            Created {new Date(current.createdAt).toLocaleString()}
            {current.createdBy?.name ? ` by ${current.createdBy.name}` : ''}
          </p>
        </div>
        <button onClick={handleDelete} className="btn-danger">
          Delete Configuration
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-xs text-slate-500 mb-1">Customer</div>
          <div className="font-medium text-slate-800">{current.customerName || '—'}</div>
          <div className="text-sm text-slate-500">{current.customerEmail || ''}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-slate-500 mb-1">Status</div>
          <span
            className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
              current.status === 'finalized' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            {current.status}
          </span>
        </div>
        <div className="card p-4">
          <div className="text-xs text-slate-500 mb-1">Total Price (locked-in at save time)</div>
          <div className="font-bold text-brand-700 text-lg">{currency(current.totalPrice)}</div>
        </div>
      </div>

      {current.notes && (
        <div className="card p-4">
          <div className="text-xs text-slate-500 mb-1">Notes</div>
          <p className="text-slate-700 text-sm">{current.notes}</p>
        </div>
      )}

      <PriceBreakdown items={current.items} total={current.totalPrice} />

      <p className="text-xs text-slate-400">
        These prices reflect what was charged when this configuration was saved. Even if the underlying component
        prices change later, this historical quotation remains unaffected.
      </p>
    </div>
  );
}
