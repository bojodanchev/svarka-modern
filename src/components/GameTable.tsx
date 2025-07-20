'use client';

import { useState, useEffect } from 'react';
import {
  createNewGame,
  dealCards,
  determineWinner,
} from '@/lib/game-logic/engine';
import { GameState, Player } from '@/lib/game-logic/types';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { Card as UICard, CardContent } from './ui/card';

const GameTable = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const newGame = createNewGame([user?.username || 'Player 1', 'Player 2']);
    setGameState(newGame);
  }, [user]);

  const handleDeal = () => {
    if (gameState) {
      const newState = dealCards(gameState);
      setGameState(newState);
      setWinner(null);
    }
  };

  const handleShowdown = () => {
    if (gameState) {
      const newWinner = determineWinner(gameState);
      setWinner(newWinner);
    }
  };

  if (!gameState) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1 bg-red-800 rounded-full p-8 relative aspect-video">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-red-600 rounded-full border-4 border-yellow-400"></div>
        {/* Player seats */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          Player 2
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          {user?.username || 'Player 1'}
        </div>
      </div>
      <div className="w-full lg:w-1/3 space-y-4">
        <Button onClick={handleDeal} className="w-full">
          Раздай карти
        </Button>
        <Button onClick={handleShowdown} className="w-full">
          Покажи картите
        </Button>
        <UICard>
          <CardContent className="p-4">
            <h2 className="text-xl font-bold mb-2">Чат</h2>
            <div className="h-48 bg-muted rounded-md p-2">
              <p>21:39:34 Масата е отворена</p>
              <p>21:39:34 {user?.username || 'bojodanchev'} отвори масата.</p>
            </div>
          </CardContent>
        </UICard>
        {winner && (
          <div className="mt-4 text-2xl font-bold text-green-500">
            Победител: {winner.name}!
          </div>
        )}
      </div>
    </div>
  );
};

export default GameTable; 