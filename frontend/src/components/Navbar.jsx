import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Laptop, Menu, X } from 'lucide-react';
import { logout } from '../store/slices/authSlice';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/components', label: 'Components' },
  { to: '/configurations', label: 'Configurations' },
  { to: '/configurations/new', label: '+ New Config' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-brand-500 text-white' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 group cursor-default">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-500 text-white transition-transform duration-300 ease-out group-hover:rotate-6 group-hover:scale-110">
              <Laptop size={18} strokeWidth={2.2} />
            </span>
            <span className="font-semibold text-slate-800 hidden sm:block tracking-tight">
              Config<span className="text-brand-500">Forge</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {user?.name}
            </span>
            <button onClick={handleLogout} className="btn-secondary text-sm py-1.5">
              Logout
            </button>
          </div>

          <button
            className="md:hidden p-2 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 px-4 py-3 space-y-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-sm text-slate-500">{user?.name}</span>
            <button onClick={handleLogout} className="btn-secondary text-sm py-1.5">
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}