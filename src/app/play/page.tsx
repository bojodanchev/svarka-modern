'use client';

import GameTable from '@/components/GameTable';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const PlayPage = () => {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn, router]);

  if (isLoading) {
    return <div>Loading...</div>; // or a loading spinner
  }

  return (
    <div className="container mx-auto p-4">
      <GameTable />
    </div>
  );
};

export default PlayPage; 