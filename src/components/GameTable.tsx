'use client';

import { GameState, Card, PlayerActionType } from '@/lib/game-logic/types';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useGameEngine } from '@/hooks/useGameEngine'; // New hook

interface GameTableProps {
  tableId: string; // Keep for potential future use (e.g., chat)
  initialGameState: GameState;
}

const CardComponent = ({ card }: { card: Card }) => (
    <div className="bg-white text-black rounded-md p-2 w-16 h-24 flex flex-col justify-between">
      <span className="text-xl">{card.rank}</span>
      <span className="text-2xl">{card.suit}</span>
    </div>
);
  
const translateAction = (action: PlayerActionType | null): string => {
    if (!action) return '';
    switch (action) {
      case 'fold': return 'Пас';
      case 'call': return 'Плащам';
      case 'bet': return 'Залагам';
      case 'raise': return 'Вдигам';
      default: return '';
    }
};

const GameTable = ({ tableId, initialGameState }: GameTableProps) => {
  const { user } = useAuth();
  const { gameState, handlePlayerAction, startNewRound, isProcessing } = useGameEngine(initialGameState, user);
  const [betAmount, setBetAmount] = useState(initialGameState.minBet || 20);
  
  if (!gameState || !user) {
    return <div>Loading game...</div>;
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === user.uid;
  
  const handleActionClick = (type: 'bet' | 'raise' | 'call' | 'fold') => {
    if (isProcessing) return;
    let amount = 0;
    if (type === 'bet' || type === 'raise') {
        amount = betAmount;
    }
    handlePlayerAction({ type, amount });
  }

  const handleStartNewRound = () => {
    if (isProcessing) return;
    startNewRound();
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">
        <div className="lg:col-span-3 bg-background text-foreground p-8 rounded-lg shadow-2xl relative min-h-[800px] flex items-center justify-center">
          <div className="absolute w-[95%] h-[75%] bg-primary rounded-[50%] shadow-2xl border-4 border-secondary/50"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
            <h2 className="text-3xl font-bold mb-4 text-secondary">
              Пот: ${gameState.pot}
            </h2>
          </div>
          {gameState.players.map((player, index) => {
            const positions = [
              { top: '85%', left: '50%', transform: 'translate(-50%, -50%)' },
              { top: '50%', left: '10%', transform: 'translate(-50%, -50%)' },
              { top: '15%', left: '50%', transform: 'translate(-50%, -50%)' },
              { top: '50%', left: '90%', transform: 'translate(-50%, -50%)' },
            ];
            return (
              <div
                key={player.id}
                className="absolute w-64 text-center p-4 z-10"
                style={positions[index]}
              >
                <div
                  className={`bg-card rounded-lg p-4 border-2 ${
                    gameState.currentPlayerIndex === index
                      ? 'border-primary animate-pulse'
                      : 'border-secondary/20'
                  }`}
                >
                  <h3 className="font-bold text-lg text-secondary">
                    {player.name}
                  </h3>
                  <p>Баланс: ${player.balance}</p>
                  {player.currentBet > 0 && (
                    <p className="text-primary-foreground">
                      Залог: ${player.currentBet}
                    </p>
                  )}
                  {player.hasFolded && (
                    <p className="text-destructive">Пас</p>
                  )}
                  {player.lastAction && (
                    <p className="text-muted-foreground text-sm">
                      Действие: {translateAction(player.lastAction)}
                    </p>
                  )}
                  <div className="flex justify-center space-x-2 mt-2 h-24">
                    {player.hand.map((card, i) => (
                      <CardComponent key={i} card={card} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          {isMyTurn && gameState.phase === 'betting' && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center space-x-4 bg-card/80 backdrop-blur-sm p-4 rounded-lg border border-secondary/20 z-20">
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value, 10)))}
                className="w-24 bg-input text-foreground"
                disabled={isProcessing}
              />
              <Button onClick={() => handleActionClick('bet')} disabled={isProcessing}>Заложи</Button>
              <Button onClick={() => handleActionClick('raise')} disabled={isProcessing}>Вдигни</Button>
              <Button onClick={() => handleActionClick('call')} disabled={isProcessing}>Плати</Button>
              <Button onClick={() => handleActionClick('fold')} variant="destructive" disabled={isProcessing}>Пас</Button>
            </div>
          )}
          {gameState.phase === 'round-over' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card/90 p-8 rounded-lg z-30 text-center">
              <h3 className="text-2xl font-bold text-secondary">Край на рунда!</h3>
              <p className="text-xl mt-2">
                Победител: {gameState.roundWinner?.name}
              </p>
              <Button
                className="mt-4"
                onClick={handleStartNewRound}
                disabled={isProcessing}
              >
                Нов рунд
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile View */}
       <div className="lg:hidden flex flex-col gap-4 p-2">
        {gameState.players.map((player, index) => (
          <div key={player.id} className={`w-full text-center p-2 bg-card rounded-lg border-2 ${gameState.currentPlayerIndex === index ? 'border-primary animate-pulse' : 'border-secondary/20'}`}>
            <h3 className="font-bold text-md text-secondary">{player.name}</h3>
            <p className="text-sm">Баланс: ${player.balance}</p>
            {player.currentBet > 0 && <p className="text-primary-foreground text-sm">Залог: ${player.currentBet}</p>}
            {player.lastAction && <p className="text-muted-foreground text-xs">Действие: {translateAction(player.lastAction)}</p>}
            <div className="flex justify-center space-x-1 mt-1">
              {player.hand.map((card, i) => (
                <div key={i} className="bg-white text-black rounded p-1 w-12 h-16 flex flex-col justify-between text-xs">
                  <span className="font-bold">{card.rank}</span>
                  <span>{card.suit}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="text-center my-4">
            <h2 className="text-2xl font-bold text-secondary">Пот: ${gameState.pot}</h2>
        </div>
        {isMyTurn && gameState.phase === 'betting' && (
          <div className="fixed bottom-0 left-0 right-0 flex items-center justify-around space-x-1 bg-card/90 backdrop-blur-sm p-2 border-t border-secondary/20 z-50">
            <Input type="number" value={betAmount} onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value, 10)))} className="w-16 bg-input text-foreground text-xs p-1" disabled={isProcessing}/>
            <Button size="sm" onClick={() => handleActionClick('bet')} disabled={isProcessing}>Заложи</Button>
            <Button size="sm" onClick={() => handleActionClick('raise')} disabled={isProcessing}>Вдигни</Button>
            <Button size="sm" onClick={() => handleActionClick('call')} disabled={isProcessing}>Плати</Button>
            <Button size="sm" onClick={() => handleActionClick('fold')} variant="destructive" disabled={isProcessing}>Пас</Button>
          </div>
        )}
         {gameState.phase === 'round-over' && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-card/90 p-6 rounded-lg text-center">
                <h3 className="text-xl font-bold text-secondary">Край на рунда!</h3>
                <p className="text-lg mt-2">Победител: {gameState.roundWinner?.name}</p>
                <Button className="mt-4" onClick={handleStartNewRound} disabled={isProcessing}>Нов рунд</Button>
            </div>
           </div>
        )}
      </div>
    </>
  );
};

export default GameTable; 