'use client';

import GameTable from '@/components/GameTable';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const PlayPage = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  if (isLoading || !isLoggedIn) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <GameTable />
    </div>
  );
};

export default PlayPage; 