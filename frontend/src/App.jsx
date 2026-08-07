import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Components from './pages/Components.jsx';
import ConfigBuilder from './pages/ConfigBuilder.jsx';
import ConfigList from './pages/ConfigList.jsx';
import ConfigDetail from './pages/ConfigDetail.jsx';

export default function App() {
  const { user } = useSelector((s) => s.auth);

  return (
    <div className="min-h-screen bg-slate-50">
      {user && <Navbar />}
      <main className={user ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6' : ''}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/components"
            element={
              <PrivateRoute>
                <Components />
              </PrivateRoute>
            }
          />
          <Route
            path="/configurations/new"
            element={
              <PrivateRoute>
                <ConfigBuilder />
              </PrivateRoute>
            }
          />
          <Route
            path="/configurations"
            element={
              <PrivateRoute>
                <ConfigList />
              </PrivateRoute>
            }
          />
          <Route
            path="/configurations/:id"
            element={
              <PrivateRoute>
                <ConfigDetail />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
