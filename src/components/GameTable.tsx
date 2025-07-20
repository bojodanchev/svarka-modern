'use client';

import { useState, useEffect } from 'react';
import {
  createNewGame,
  dealCards,
  determineWinner,
} from '@/lib/game-logic/engine';
import { GameState, Player } from '@/lib/game-logic/types';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const GameTable = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);

  useEffect(() => {
    // Initialize the game with two players
    const newGame = createNewGame(['Player 1', 'Player 2']);
    setGameState(newGame);
  }, []);

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
    <div className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4">Игра Сварка</h1>
      <div className="flex justify-around w-full mb-4">
        {gameState.players.map(player => (
          <Card key={player.id} className="w-1/3">
            <CardContent className="p-4">
              <h2 className="text-xl font-bold">{player.name}</h2>
              <p>Баланс: ${player.balance}</p>
              <div className="flex mt-2">
                {player.hand.map((card, index) => (
                  <Card key={index} className="w-16 h-24 mr-2">
                    <CardContent className="flex items-center justify-center h-full">
                      <span className="text-2xl">
                        {card.rank}
                        {card.suit}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex space-x-4">
        <Button onClick={handleDeal}>Раздай карти</Button>
        <Button onClick={handleShowdown}>Покажи картите</Button>
      </div>
      {winner && (
        <div className="mt-4 text-2xl font-bold text-green-500">
          Победител: {winner.name}!
        </div>
      )}
    </div>
  );
};

export default GameTable; 