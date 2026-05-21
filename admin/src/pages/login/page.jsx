'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { setAdmin, admin } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (admin && admin.token) router.push('/dashboard');
  }, [admin, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/admin/login', { email, password });
      setAdmin(res.data);
      toast.success('Welcome back');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-md bg-white p-10 border border-ink/10 shadow-xl">
        <div className="flex flex-col items-center mb-10">
          <Image
            src="/logo.png?v=2"
            alt="Octune Vintage"
            width={160}
            height={64}
            className="h-16 w-auto object-contain mb-4"
          />
          <p className="text-ink/60 text-sm uppercase tracking-widest">Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input 
              type="email" 
              placeholder="Admin Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input bg-paper/50"
              required 
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input bg-paper/50"
              required 
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full shadow-md mt-4">
            {loading ? 'Authenticating...' : 'Enter Archives'}
          </button>
        </form>
      </div>
    </div>
  );
}
