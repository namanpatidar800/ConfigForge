import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchComponents } from '../store/slices/componentSlice';
import { fetchConfigurations } from '../store/slices/configSlice';
import { currency } from '../components/PriceBreakdown';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { list: components } = useSelector((s) => s.components);
  const { list: configurations, pagination } = useSelector((s) => s.configurations);

  useEffect(() => {
    dispatch(fetchComponents({}));
    dispatch(fetchConfigurations({ limit: 5, sort: '-createdAt' }));
  }, [dispatch]);

  const activeComponents = useMemo(() => components.filter((c) => c.isActive), [components]);
  const avgConfigValue = useMemo(() => {
    if (!configurations.length) return 0;
    return configurations.reduce((sum, c) => sum + c.totalPrice, 0) / configurations.length;
  }, [configurations]);

  const stats = [
    { label: 'Active Components', value: activeComponents.length, icon: '🧩', to: '/components' },
    { label: 'Saved Configurations', value: pagination.total, icon: '🗂️', to: '/configurations' },
    { label: 'Avg. Quote Value', value: currency(avgConfigValue), icon: '📊', to: '/configurations' },
    { label: 'Component Categories', value: 8, icon: '📁', to: '/components' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500">Here's a quick overview of your laptop configuration system.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link to={s.to} key={s.label} className="card p-4 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold text-slate-800">{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/configurations/new" className="btn-primary">
          + Create New Configuration
        </Link>
        <Link to="/components" className="btn-secondary">
          Manage Components
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">Recent Configurations</h2>
          <Link to="/configurations" className="text-sm text-brand-600 hover:underline">
            View all →
          </Link>
        </div>
        {configurations.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No configurations saved yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {configurations.map((c) => (
              <Link
                to={`/configurations/${c._id}`}
                key={c._id}
                className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg"
              >
                <div>
                  <div className="font-medium text-slate-800">{c.configName}</div>
                  <div className="text-xs text-slate-500">
                    {c.customerName || 'No customer name'} · {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="font-semibold text-brand-700">{currency(c.totalPrice)}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
