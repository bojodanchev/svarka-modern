'use client';

import { Game } from '@/lib/game-logic/engine';
import { GameState, PlayerAction, Card } from '@/lib/game-logic/types';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Message {
  timestamp: string;
  username: string;
  text: string;
  isSystem: boolean;
}

const CardComponent = ({ card }: { card: Card }) => (
  <div className="bg-white text-black rounded-md p-2 w-16 h-24 flex flex-col justify-between">
    <span className="text-xl">{card.rank}</span>
    <span className="text-2xl">{card.suit}</span>
  </div>
);

const GameTable = () => {
  const { user } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [betAmount, setBetAmount] = useState(20);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      const playerNames = [user.username, 'Player 2', 'Player 3', 'Player 4'];
      const newGame = new Game(playerNames, 'player-0');
      newGame.startNewRound();
      setGame(newGame);
      setGameState(newGame.getState());
      setMessages([
        {
          timestamp: new Date().toLocaleTimeString(),
          username: 'Система',
          text: 'Масата е отворена.',
          isSystem: true,
        },
      ]);
    }
  }, [user]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!game || !gameState || !user) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    if (currentPlayer.isAI && gameState.phase === 'betting') {
      const aiAction: PlayerAction =
        Math.random() < 0.2 ? { type: 'fold' } : { type: 'call' };

      const timer = setTimeout(() => {
        const updatedState = game.handlePlayerAction(currentPlayer.id, aiAction);
        setGameState(updatedState);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [game, gameState, user]);

  const onPlayerAction = (action: PlayerAction) => {
    if (!game || !gameState) return;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const updatedState = game.handlePlayerAction(currentPlayer.id, action);
    setGameState(updatedState);
  };

  const handleSendMessage = () => {
    if (chatInput.trim() === '' || !user) return;
    const newMessage: Message = {
      timestamp: new Date().toLocaleTimeString(),
      username: user.username,
      text: chatInput,
      isSystem: false,
    };
    setMessages((prev) => [...prev, newMessage]);
    setChatInput('');
  };

  const handleChatKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!gameState) {
    return <div>Loading game...</div>;
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = !currentPlayer.isAI;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">
      <div className="lg:col-span-2 bg-background text-foreground p-8 rounded-lg shadow-2xl relative min-h-[800px] flex items-center justify-center">
        <div className="absolute w-[95%] h-[75%] bg-primary rounded-[50%] shadow-2xl border-4 border-secondary/50"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
          <h2 className="text-3xl font-bold mb-4 text-secondary">
            Pot: ${gameState.pot}
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
                    ? 'border-primary'
                    : 'border-secondary/20'
                }`}
              >
                <h3 className="font-bold text-lg text-secondary">
                  {player.name}
                </h3>
                <p>Balance: ${player.balance}</p>
                {player.currentBet > 0 && (
                  <p className="text-primary-foreground">
                    Bet: ${player.currentBet}
                  </p>
                )}
                {player.hasFolded && (
                  <p className="text-destructive">Folded</p>
                )}
                {player.lastAction && (
                  <p className="text-muted-foreground text-sm">
                    Action: {player.lastAction}
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
              onChange={(e) => setBetAmount(parseInt(e.target.value, 10))}
              className="w-24 bg-input text-foreground"
            />
            <Button onClick={() => onPlayerAction({ type: 'bet', amount: betAmount })}>
              Bet
            </Button>
            <Button
              onClick={() => onPlayerAction({ type: 'raise', amount: gameState.lastBet + betAmount })}
            >
              Raise
            </Button>
            <Button onClick={() => onPlayerAction({ type: 'call' })}>Call</Button>
            <Button onClick={() => onPlayerAction({ type: 'fold' })} variant="destructive">
              Fold
            </Button>
          </div>
        )}

        {gameState.phase === 'round-over' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card/90 p-8 rounded-lg z-30 text-center">
            <h3 className="text-2xl font-bold text-secondary">Round Over!</h3>
            <p className="text-xl mt-2">
              Winner: {gameState.roundWinner?.name}
            </p>
            <Button
              className="mt-4"
              onClick={() => {
                const updatedState = game!.startNewRound();
                setGameState(updatedState);
              }}
            >
              New Round
            </Button>
          </div>
        )}
      </div>
      <div className="lg:col-span-1">
        <div className="bg-card text-card-foreground p-4 rounded-lg shadow-lg h-full flex flex-col">
          <h2 className="text-2xl font-bold text-secondary mb-4 border-b border-secondary/20 pb-2">
            Чат
          </h2>
          <div
            ref={chatContainerRef}
            className="flex-grow space-y-2 overflow-y-auto"
          >
            {messages.map((msg, index) => (
              <p key={index}>
                <span className="text-muted-foreground">{msg.timestamp}</span>{' '}
                <span
                  className={
                    msg.isSystem ? 'text-primary' : 'text-secondary'
                  }
                >
                  {msg.username}:
                </span>{' '}
                {msg.text}
              </p>
            ))}
          </div>
          <div className="mt-4 flex space-x-2">
            <Input
              placeholder="Вашето съобщение..."
              className="bg-input"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleChatKeyDown}
            />
            <Button onClick={handleSendMessage}>Изпрати</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameTable; 