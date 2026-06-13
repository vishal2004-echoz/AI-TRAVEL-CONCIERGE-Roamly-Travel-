import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../api';
import { Compass, Eye, EyeOff } from 'lucide-react';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      navigate('/explore');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-md">
        <div className="card-warm p-8 rounded-3xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #c8882a, #dca042)' }}>
              <Compass size={24} className="text-dusk-900" />
            </div>
            <h1 className="font-display text-2xl font-bold text-sand-50">Welcome back</h1>
            <p className="font-body text-sand-400 mt-1 text-sm">Ready for your next adventure?</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm font-body text-red-300"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sand-300 text-sm font-body mb-1.5">Email</label>
              <input type="email" className="input-vintage" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sand-300 text-sm font-body mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input-vintage pr-10"
                  placeholder="••••••••" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sand-400">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full py-3 mt-2 text-base">
              {loading ? '✈️ Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-sand-400 text-sm font-body">
            No account?{' '}
            <Link to="/signup" className="text-sand-200 hover:text-sand-100 underline underline-offset-2">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
