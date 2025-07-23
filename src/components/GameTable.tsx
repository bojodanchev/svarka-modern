'use client';

import { GameState, Card, PlayerActionType } from '@/lib/game-logic/types';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useGameEngine } from '@/hooks/useGameEngine';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

interface GameTableProps {
  tableId: string; // Keep for potential future use (e.g., chat)
  initialGameState: GameState;
}

interface Message {
  id?: string;
  timestamp: any;
  username: string;
  text: string;
  isSystem?: boolean;
}

const CardComponent = ({ card, isVisible }: { card: Card; isVisible: boolean; }) => {
    if (!isVisible) {
        return (
            <div className="bg-white rounded-md w-16 h-24 flex items-center justify-center">
                <img src="/card-back.png" alt="Card Back" className="w-full h-full object-cover rounded-md" />
            </div>
        );
    }
    return (
        <div className="bg-white text-black rounded-md p-2 w-16 h-24 flex flex-col justify-between">
            <span className="text-xl">{card.rank}</span>
            <span className="text-2xl">{card.suit}</span>
        </div>
    );
};
  
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

const getPlayerPosition = (index: number, count: number) => {
    // We start at 90 degrees (bottom of the circle) and distribute players evenly.
    const angle = (Math.PI / 2) + (index / count) * 2 * Math.PI;
    // We use different radii for x and y to create an oval shape.
    const xRadius = 45;
    const yRadius = 38;
    // Calculate the position, starting from a 50,50 center.
    const x = 50 + xRadius * Math.cos(angle);
    const y = 50 + yRadius * Math.sin(angle);
    
    return {
        top: `${y}%`,
        left: `${x}%`,
        transform: 'translate(-50%, -50%)',
    };
};

const GameTable = ({ tableId, initialGameState }: GameTableProps) => {
  const { user } = useAuth();
  const { gameState, handlePlayerAction, startNewRound, isProcessing, handlePlayerRejoin, handleStartNextRoundWithoutPlayer } = useGameEngine(initialGameState, user);
  const [betAmount, setBetAmount] = useState(initialGameState.minBet || 20);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const isTied = gameState.phase === 'tie-break';
  const amITied = user && gameState.tiedPlayerIds?.includes(user.uid);
  const canRejoin = user && (!gameState.tiedPlayerIds?.includes(user.uid)) && ((gameState.players.find(p => p.id === user.uid)?.balance ?? 0) >= gameState.minBet);
  const hasRejoined = user && gameState.players.find(p => p.id === user.uid)?.isReadyForNextRound;

  // Chat logic
  useEffect(() => {
    if (!tableId) return;
    const q = query(collection(db, `gameRooms/${tableId}/messages`), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs: Message[] = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [tableId]);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
    startNewRound(undefined, false);
  }

  const handleSendMessage = async () => {
    if (chatInput.trim() === '' || !user) return;
    const messagesRef = collection(db, `gameRooms/${tableId}/messages`);
    await addDoc(messagesRef, {
      timestamp: serverTimestamp(),
      username: user.displayName || user.email, // Use user profile or email
      text: chatInput,
    });
    setChatInput('');
  };

  const handleChatKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">
        <div className="lg:col-span-2 bg-background text-foreground p-8 rounded-lg shadow-2xl relative min-h-[800px] flex items-center justify-center">
          <div className="absolute w-[95%] h-[75%] bg-primary rounded-[50%] shadow-2xl border-4 border-secondary/50"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
            <h2 className="text-3xl font-bold mb-4 text-secondary">
              Пот: ${gameState.pot}
            </h2>
          </div>
          {gameState.players.map((player, index) => {
            const position = getPlayerPosition(index, gameState.players.length);
            return (
              <div
                key={player.id}
                className="absolute w-64 text-center p-4 z-10"
                style={position}
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
                      <CardComponent key={i} card={card} isVisible={player.id === user.uid || gameState.phase === 'round-over'}/>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          {isMyTurn && gameState.phase === 'betting' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-4 bg-card/80 backdrop-blur-sm p-4 rounded-lg border border-secondary/20 z-20">
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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] bg-card/90 p-8 rounded-lg z-30 text-center shadow-lg">
              <h3 className="text-2xl font-bold text-secondary">Край на рунда!</h3>
              <p className="text-xl mt-4">
                Победител: {gameState.roundWinner?.name}
              </p>
               <p className="text-lg text-muted-foreground mt-1">
                {gameState.roundWinner?.description} ({gameState.roundWinner?.score} точки)
              </p>
              <div className="flex justify-center space-x-2 my-4">
                {gameState.roundWinner?.hand.map((card, i) => (
                    <CardComponent key={i} card={card} isVisible={true} />
                ))}
              </div>
              <Button
                className="mt-4"
                onClick={handleStartNewRound}
                disabled={isProcessing}
              >
                Нов рунд
              </Button>
            </div>
          )}
           {isTied && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] bg-card/90 p-8 rounded-lg z-30 text-center shadow-lg">
              <h3 className="text-2xl font-bold text-primary">Равенство!</h3>
              <p className="text-xl mt-4">
                Следващият рунд е за разрешаване на равенството.
              </p>
              <p className="text-lg text-muted-foreground mt-1">
                Потът се прехвърля: ${gameState.pot}
              </p>
              
              {amITied && <p className="text-secondary mt-2">Вие участвате автоматично. Изчаквате...</p>}
              
              {canRejoin && !hasRejoined && (
                <div className="mt-4 flex flex-col gap-2">
                  <Button onClick={handlePlayerRejoin} disabled={isProcessing}>
                    Плати ${gameState.minBet}, за да участваш
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleStartNextRoundWithoutPlayer} disabled={isProcessing}>
                    Откажи се
                  </Button>
                </div>
              )}

              {hasRejoined && <p className="text-secondary mt-2">Платено! Изчаквате другите играчи...</p>}

              {!amITied && !canRejoin && !hasRejoined && (
                   <p className="text-muted-foreground mt-2">Изчаквате другите играчи...</p>
              )}
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-card text-card-foreground p-4 rounded-lg shadow-lg h-full flex flex-col">
            <h2 className="text-2xl font-bold text-secondary mb-4 border-b border-secondary/20 pb-2">
              Чат на масата
            </h2>
            <div
              ref={chatContainerRef}
              className="flex-grow space-y-2 overflow-y-auto pr-2"
            >
              {messages.map((msg) => (
                <p key={msg.id}>
                  <span className="text-muted-foreground">{(msg.timestamp?.seconds ? new Date(msg.timestamp.seconds * 1000) : new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>{' '}
                  <span
                    className={
                      msg.isSystem ? 'text-primary' : 'font-semibold text-secondary'
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
                <CardComponent key={i} card={card} isVisible={player.id === user.uid || gameState.phase === 'round-over'} />
              ))}
            </div>
          </div>
        ))}
        <div className="text-center my-4">
            <h2 className="text-2xl font-bold text-secondary">Пот: ${gameState.pot}</h2>
        </div>
        {isMyTurn && gameState.phase === 'betting' && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-lg mx-auto flex items-center justify-around space-x-1 bg-card/90 backdrop-blur-sm p-2 border-t border-secondary/20 z-50">
            <Input type="number" value={betAmount} onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value, 10)))} className="w-16 bg-input text-foreground text-xs p-1" disabled={isProcessing}/>
            <Button size="sm" onClick={() => handleActionClick('bet')} disabled={isProcessing}>Заложи</Button>
            <Button size="sm" onClick={() => handleActionClick('raise')} disabled={isProcessing}>Вдигни</Button>
            <Button size="sm" onClick={() => handleActionClick('call')} disabled={isProcessing}>Плати</Button>
            <Button size="sm" onClick={() => handleActionClick('fold')} variant="destructive" disabled={isProcessing}>Пас</Button>
          </div>
        )}
         {gameState.phase === 'round-over' && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-card/90 p-6 rounded-lg text-center shadow-lg">
                <h3 className="text-xl font-bold text-secondary">Край на рунда!</h3>
                <p className="text-lg mt-2">Победител: {gameState.roundWinner?.name}</p>
                 <p className="text-md text-muted-foreground mt-1">
                  {gameState.roundWinner?.description} ({gameState.roundWinner?.score} точки)
                </p>
                <div className="flex justify-center space-x-2 my-3">
                    {gameState.roundWinner?.hand.map((card, i) => (
                        <CardComponent key={i} card={card} isVisible={true} />
                    ))}
                </div>
                <Button className="mt-4" onClick={() => startNewRound(undefined, false)} disabled={isProcessing}>Нов рунд</Button>
            </div>
           </div>
        )}
        {isTied && (
             <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-card/90 p-6 rounded-lg text-center shadow-lg">
                    <h3 className="text-xl font-bold text-primary">Равенство!</h3>
                    <p className="text-md mt-2">Потът се прехвърля: ${gameState.pot}</p>
                    
                    {amITied && <p className="text-secondary mt-2 text-sm">Вие участвате автоматично. Изчаквате...</p>}
                    
                    {canRejoin && !hasRejoined && (
                        <div className="mt-4 flex flex-col gap-2">
                            <Button onClick={handlePlayerRejoin} disabled={isProcessing} size="sm">
                                Плати ${gameState.minBet}, за да участваш
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleStartNextRoundWithoutPlayer} disabled={isProcessing}>
                                Откажи се
                            </Button>
                        </div>
                    )}

                    {hasRejoined && <p className="text-secondary mt-2 text-sm">Платено! Изчаквате...</p>}
                </div>
             </div>
        )}
      </div>
    </>
  );
};

export default GameTable; 