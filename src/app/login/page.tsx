'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { loginWithEmail, loginAsGuest } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await loginWithEmail(email, password);
      router.push('/tables');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    try {
      await loginAsGuest();
      router.push('/tables');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-primary">Вход</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="Имейл"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-input"
          />
          <Input
            type="password"
            placeholder="Парола"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-input"
          />
          <Button type="submit" className="w-full">
            Вход
          </Button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-secondary/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Или</span>
          </div>
        </div>
        <Button onClick={handleGuestLogin} variant="outline" className="w-full">
          Вход като гост
        </Button>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <p className="text-center text-muted-foreground">
          Нямате акаунт?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Регистрирайте се
          </Link>
        </p>
      </div>
    </div>
  );
} 