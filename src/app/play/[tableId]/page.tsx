'use client';

import { useAuth } from '@/hooks/useAuth';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { GameState } from '@/lib/game-logic/types';
import GameTable from '@/components/GameTable';

const PlayPage = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tableId = typeof params.tableId === 'string' ? params.tableId : '';

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (!tableId) return;

    const roomRef = doc(db, 'gameRooms', tableId);
    const unsubscribe = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        setGameState(doc.data() as GameState);
      } else {
        setError('Тази маса не съществува.');
      }
    });

    return () => unsubscribe();
  }, [tableId]);

  if (isAuthLoading || !user) {
    return <div>Зареждане на автентикация...</div>;
  }

  if (error) {
    return <div>Грешка: {error}</div>;
  }
  
  if (!gameState) {
    return <div>Зареждане на играта...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <GameTable tableId={tableId} initialGameState={gameState} />
    </div>
  );
};

export default PlayPage; 