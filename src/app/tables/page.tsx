'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface GameRoom {
  id: string;
  name: string;
  playersCount: number;
  maxPlayers: number;
  minBet: number;
  maxBet: number;
  createdBy: string;
}

export default function TablesPage() {
  const [gameRooms, setGameRooms] = useState<GameRoom[]>([]);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const q = collection(db, 'gameRooms');
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const rooms: GameRoom[] = [];
      querySnapshot.forEach((doc) => {
        rooms.push({ id: doc.id, ...doc.data() } as GameRoom);
      });
      setGameRooms(rooms);
    });

    return () => unsubscribe();
  }, []);

  const createNewRoom = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      await addDoc(collection(db, "gameRooms"), {
        name: `Маса на ${user.displayName || 'Анонимен'}`,
        players: [],
        playersCount: 0,
        maxPlayers: 4,
        minBet: 10,
        maxBet: 50,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        gameState: 'waiting'
      });
    } catch (error) {
      console.error("Error creating new room: ", error);
    }
  };

  if (isLoading) {
    return <div>Зареждане...</div>;
  }

  return (
    <div className="container mx-auto p-4 py-8 md:py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-primary">Маси за игра</h1>
        <Button onClick={createNewRoom}>Създай нова маса</Button>
      </div>
      <div className="max-w-5xl mx-auto space-y-4">
        {gameRooms.map((room) => (
          <Card key={room.id} className="bg-card/80 backdrop-blur-sm border-secondary/20 hover:border-primary transition-all">
            <div className="grid grid-cols-2 md:grid-cols-4 items-center p-4 gap-4">
              <div className="font-medium text-lg">{room.name}</div>
              <div className="text-muted-foreground">
                <span className="font-semibold">{room.playersCount}</span> / {room.maxPlayers} играчи
              </div>
              <div className="text-muted-foreground">
                <span className="font-semibold">${room.minBet}</span> / ${room.maxBet}
              </div>
              <div className="flex justify-end">
                <Link href={`/play/${room.id}`}>
                  <Button>Влез</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
        {gameRooms.length === 0 && (
          <p className="text-center text-muted-foreground">Няма налични маси. Създайте нова!</p>
        )}
      </div>
    </div>
  );
} 