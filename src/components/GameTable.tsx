'use client';

import {
  createNewGame,
  dealCards,
  handlePlayerAction,
  determineWinner,
} from '@/lib/game-logic/engine';
import { GameState, Player, Card, PlayerAction } from '@/lib/game-logic/types';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const CardComponent = ({ card }: { card: Card }) => (
  <div className="bg-white text-black rounded-md p-2 w-16 h-24 flex flex-col justify-between">
    <span className="text-xl">{card.rank}</span>
    <span className="text-2xl">{card.suit}</span>
  </div>
);

const GameTable = () => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [betAmount, setBetAmount] = useState(0);

  useEffect(() => {
    if (user) {
      const playerNames = [user.username, 'Player 2', 'Player 3', 'Player 4'];
      const newGame = createNewGame(playerNames);
      const gameWithCards = dealCards(newGame);
      setGameState(gameWithCards);
    }
  }, [user]);

  useEffect(() => {
    if (!gameState || !user) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const isAITurn = currentPlayer.name !== user.username;

    if (isAITurn && gameState.currentPhase === 'betting') {
      const aiAction = (): PlayerAction => {
        // Simple AI: 50% chance to fold, otherwise call.
        if (Math.random() < 0.5) {
          return { type: 'fold' };
        }
        return { type: 'call' };
      };

      const timer = setTimeout(() => {
        onPlayerAction(aiAction());
      }, 2000); // AI "thinks" for 2 seconds

      return () => clearTimeout(timer);
    }
  }, [gameState, user]);

  const onPlayerAction = (action: PlayerAction) => {
    if (!gameState) return;
    const newGameState = handlePlayerAction(gameState, action);
    setGameState(newGameState);

    if (newGameState.currentPhase === 'showdown') {
      const winner = determineWinner(newGameState);
      // You can add logic here to display the winner, update balances, etc.
      console.log('Winner:', winner);
      // For now, let's just start a new round after a delay
      setTimeout(() => {
        const resetGame = dealCards(newGameState);
        setGameState(resetGame);
      }, 5000);
    }
  };

  if (!gameState) {
    return <div>Loading game...</div>;
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer.name === user?.username;

  return (
    <div className="bg-background text-foreground p-8 rounded-lg shadow-2xl relative min-h-[800px]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <h2 className="text-3xl font-bold mb-4 text-secondary">Pot: ${gameState.pot}</h2>
        <div className="flex space-x-2">
          {/* Community cards or other info can go here */}
        </div>
      </div>

      {gameState.players.map((player, index) => {
        const position = [
          'bottom-0 left-1/2 -translate-x-1/2', // Player 1 (user)
          'top-1/2 left-0 -translate-y-1/2', // Player 2
          'top-0 left-1/2 -translate-x-1/2', // Player 3
          'top-1/2 right-0 -translate-y-1/2', // Player 4
        ][index];

        return (
          <div
            key={player.id}
            className={`absolute ${position} w-64 text-center p-4 bg-card rounded-lg border-2 ${
              gameState.currentPlayerIndex === index ? 'border-primary' : 'border-secondary/20'
            }`}
          >
            <h3 className="font-bold text-lg text-secondary">{player.name}</h3>
            <p>Balance: ${player.balance}</p>
            {player.currentBet > 0 && <p className="text-primary-foreground">Bet: ${player.currentBet}</p>}
            {player.hasFolded && <p className="text-destructive">Folded</p>}
            {player.lastAction && <p className="text-muted-foreground text-sm">Action: {player.lastAction}</p>}

            <div className="flex justify-center space-x-2 mt-2 h-24">
              {player.hand.map((card, i) => (
                <CardComponent key={i} card={card} />
              ))}
            </div>
          </div>
        );
      })}

      {isMyTurn && (
        <div className="absolute bottom-40 left-1/2 -translate-x-1/2 flex items-center space-x-4 bg-card/80 backdrop-blur-sm p-4 rounded-lg border border-secondary/20">
          <Input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(parseInt(e.target.value, 10))}
            className="w-24 bg-input text-foreground"
            min={gameState.minRaise}
          />
          <Button onClick={() => onPlayerAction({ type: 'bet', amount: betAmount })}>
            Bet
          </Button>
          <Button onClick={() => onPlayerAction({ type: 'raise', amount: betAmount })}>
            Raise
          </Button>
          <Button onClick={() => onPlayerAction({ type: 'call' })}>Call</Button>
          <Button onClick={() => onPlayerAction({ type: 'fold' })} variant="destructive">
            Fold
          </Button>
        </div>
      )}
    </div>
  );
};

export default GameTable; 