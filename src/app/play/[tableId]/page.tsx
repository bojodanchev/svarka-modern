'use client';

import GameTable from '@/components/GameTable';
import { useGameRooms } from '@/context/GameRoomsContext';
import { useAuth } from '@/hooks/useAuth';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const PlayPage = () => {
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const { getOrCreateGame } = useGameRooms();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const tableId = typeof params.tableId === 'string' ? params.tableId : '';
  const minBet = parseInt(searchParams.get('minBet') || '5', 10);
  const maxBet = parseInt(searchParams.get('maxBet') || '10', 10); // Not used in engine yet, but good to have

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isAuthLoading, router]);

  if (isAuthLoading || !isLoggedIn || !user) {
    return <div>Loading...</div>;
  }

  if (!tableId) {
    return <div>Table not found.</div>
  }

  const playerNames = [user.username, 'Мария', 'Петър', 'Георги'];
  const game = getOrCreateGame(tableId, playerNames, 'player-0', { smallBlind: minBet, bigBlind: maxBet / 2 });

  return (
    <div className="container mx-auto p-4">
      <GameTable game={game} />
    </div>
  );
};

export default PlayPage; 