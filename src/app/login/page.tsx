'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    login();
    router.push('/tables');
  };

  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-4xl font-extrabold text-center mb-6">Вход</h1>
      <div className="max-w-md mx-auto bg-card text-card-foreground p-8 rounded-lg shadow-lg">
        <p className="text-lg leading-relaxed text-center mb-4">
          Това е симулация на вход. Натиснете бутона, за да се "логнете".
        </p>
        <Button onClick={handleLogin} className="w-full">
          Вход
        </Button>
      </div>
    </div>
  );
};

export default LoginPage; 