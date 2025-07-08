import { useEffect, useState } from 'react';
import { supabase } from './src_supabase';
import App from './App';
import Login from './Login';

export default function AuthWrapper() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
}
  useEffect(() => {
    const currentSession = supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return session ? (
    <div>
      <div className="flex justify-between items-center p-4 text-sm text-gray-800">
        <span>Logged in as <strong>{session.user.email}</strong></span>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      <App session={session} />
    </div>
  ) : (
    <Login />
  );
}
