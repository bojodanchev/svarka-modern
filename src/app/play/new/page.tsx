'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GameState, Lobby, Player } from '@/lib/game-logic/types';
import GameTable from '@/components/GameTable';
import { createDeck, shuffleDeck } from '@/lib/game-logic/deck';
import { calculateScore } from '@/lib/game-logic/scoring';

const aiNames = ["Мария", "Петър", "Георги", "Иван", "Елена", "Димитър", "София", "Никола"];

const createNewGame = (lobby: Lobby, user: any): GameState => {
  const humanPlayer: Player = {
    id: user.uid,
    name: user.displayName || 'Играч',
    hand: [],
    balance: user.balance || 1000,
    currentBet: 0,
    hasFolded: false,
    isAI: false,
    score: 0,
    lastAction: null,
  };

  const players: Player[] = [humanPlayer];
  const usedNames = new Set([humanPlayer.name]);

  const numAIPlayers = Math.floor(Math.random() * (lobby.maxPlayers - 2)) + 1;
  for (let i = 0; i < numAIPlayers; i++) {
    let aiName = aiNames[Math.floor(Math.random() * aiNames.length)];
    while (usedNames.has(aiName)) {
      aiName = aiNames[Math.floor(Math.random() * aiNames.length)];
    }
    usedNames.add(aiName);
    players.push({
      id: `ai_${i}_${Date.now()}`,
      name: aiName,
      hand: [],
      balance: 1000,
      currentBet: 0,
      hasFolded: false,
      isAI: true,
      score: 0,
      lastAction: null,
    });
  }

  const deck = shuffleDeck(createDeck());
  players.forEach(p => {
    p.hand = deck.splice(0, 3);
    p.score = calculateScore(p.hand);
  });

  return {
    id: `local_${Date.now()}`,
    name: lobby.name,
    players,
    playersCount: players.length,
    maxPlayers: lobby.maxPlayers,
    minBet: lobby.minBet,
    maxBet: lobby.maxBet,
    currentPlayerIndex: 0,
    pot: 0,
    lastBet: 0,
    phase: 'betting',
    roundWinner: null,
  };
};

const PlayPage = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      const lobbyQuery = searchParams.get('lobby');
      if (lobbyQuery) {
        try {
          const lobby: Lobby = JSON.parse(decodeURIComponent(lobbyQuery));
          const newGameState = createNewGame(lobby, user);
          setGameState(newGameState);
        } catch (e) {
          setError('Невалидни данни за лоби.');
        }
      } else {
        setError('Липсват данни за лоби.');
      }
    }
  }, [user, isAuthLoading, router, searchParams]);


  if (isAuthLoading || !gameState) {
    return <div>Зареждане на играта...</div>;
  }
  
  if (error) {
    return <div>Грешка: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <GameTable tableId={gameState.id} initialGameState={gameState} />
    </div>
  );
};

export default PlayPage; 