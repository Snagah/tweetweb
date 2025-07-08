
import { useState } from 'react';
import { supabase } from './src_supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setErrorMsg(error.message);
    else window.location.reload();
  };

  const handleSignUp = async () => {
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) setErrorMsg(error.message);
    else alert('Check your email for a confirmation link.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-300 via-yellow-100 to-red-200 flex items-center justify-center">
      <div className="bg-white/30 backdrop-blur-md p-6 rounded-xl shadow-md max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">🔐 Login</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 mb-3 border rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded"
        />
        {errorMsg && <p className="text-red-600 text-sm mb-2">{errorMsg}</p>}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mb-2"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <button
          onClick={handleSignUp}
          className="w-full bg-gray-300 text-black py-2 rounded hover:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Signing up...' : 'Create account'}
        </button>
      </div>
    </div>
  );
}
