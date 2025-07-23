'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { registerWithEmail } = useAuth();
  const router = useRouter();
  const db = getFirestore();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (username.trim().length < 3) {
        setError("Потребителското име трябва да е поне 3 символа.");
        return;
    }
    try {
      const userCredential = await registerWithEmail(email, password);
      const user = userCredential.user;
      
      // Update the user's auth profile with the display name
      await updateProfile(user, { displayName: username });
      
      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        username: username,
        balance: 1000, // Starting balance
      });

      router.push('/tables');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-primary">Регистрация</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            type="text"
            placeholder="Потребителско име"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="bg-input"
          />
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
            Регистрация
          </Button>
        </form>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <p className="text-center text-muted-foreground">
          Имате акаунт?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Влезте
          </Link>
        </p>
      </div>
    </div>
  );
} 