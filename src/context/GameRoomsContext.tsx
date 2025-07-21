'use client';

import { Game } from '@/lib/game-logic/engine';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GameRoomContextType {
  games: Map<string, Game>;
  getOrCreateGame: (tableId: string, playerNames: string[], humanPlayerId: string, options: { smallBlind: number; bigBlind: number }) => Game;
}

const GameRoomsContext = createContext<GameRoomContextType | undefined>(undefined);

export const useGameRooms = () => {
  const context = useContext(GameRoomsContext);
  if (!context) {
    throw new Error('useGameRooms must be used within a GameRoomsProvider');
  }
  return context;
};

export const GameRoomsProvider = ({ children }: { children: ReactNode }) => {
  const [games, setGames] = useState<Map<string, Game>>(new Map());

  const getOrCreateGame = (tableId: string, playerNames: string[], humanPlayerId: string, options: { smallBlind: number; bigBlind: number }): Game => {
    if (games.has(tableId)) {
      return games.get(tableId)!;
    }

    const newGame = new Game(playerNames, humanPlayerId, options);
    newGame.startNewRound();
    
    const newGames = new Map(games);
    newGames.set(tableId, newGame);
    setGames(newGames);
    
    return newGame;
  };

  return (
    <GameRoomsContext.Provider value={{ games, getOrCreateGame }}>
      {children}
    </GameRoomsContext.Provider>
  );
}; 