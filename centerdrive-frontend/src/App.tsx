import { useEffect, useState } from 'react';
import axios from 'axios';
import { Sidebar } from './components/Sidebar';
import { MainPanel } from './components/MainPanel';
import { Login } from './components/Login';
import { useStore } from './store/useStore';
import { Loader2 } from 'lucide-react';

// Configure axios to always send cookies
axios.defaults.withCredentials = true;

function App() {
  const { user, setUser, setSections } = useStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const res = await axios.get(`${apiUrl}/auth/me`);
        if (res.data.user) {
          setUser(res.data.user);
          // Fetch sections
          const sectionsRes = await axios.get(`${apiUrl}/api/sections`);
          setSections(sectionsRes.data.sections);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, [setUser, setSections]);

  if (isInitializing) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-50">
        <Loader2 size={40} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen w-screen bg-zinc-50 overflow-hidden font-sans">
      <Sidebar />
      <MainPanel />
    </div>
  );
}

export default App;
