import React, { useState } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const endpoint = isRegistering ? '/auth/register' : '/auth/login';
      const payload = isRegistering ? { email, password, name } : { email, password };
      
      const res = await axios.post(`${apiUrl}${endpoint}`, payload);
      
      // Save token to localStorage
      localStorage.setItem('token', res.data.token);
      
      // Update store
      setUser(res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Terjadi kesalahan, silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100 p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
            centerDrive
          </h1>
          <p className="text-zinc-500">
            {isRegistering ? 'Buat akun baru' : 'Masuk ke akun Anda'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <input 
                type="text" 
                placeholder="Nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required={isRegistering}
              />
            </div>
          )}
          
          <div>
            <input 
              type="email" 
              placeholder="Alamat Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>
          
          <div>
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 shadow-md disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegistering ? 'Daftar' : 'Masuk')}
          </button>
        </form>

        <p className="text-zinc-500 text-sm mt-6">
          {isRegistering ? 'Sudah punya akun? ' : 'Belum punya akun? '}
          <button 
            onClick={() => setIsRegistering(!isRegistering)} 
            className="text-blue-600 font-medium hover:underline"
          >
            {isRegistering ? 'Login di sini' : 'Daftar sekarang'}
          </button>
        </p>
      </div>
    </div>
  );
};
