'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface Lobby {
  id: string;
  name: string;
  description: string;
  minBet: number;
  maxBet: number;
  maxPlayers: number;
}

const predefinedLobbies: Lobby[] = [
  { id: 'beginner', name: 'Маса за Начинаещи', description: 'Перфектна за научаване на играта. Ниски залози и приятелски настроени опоненти.', minBet: 10, maxBet: 50, maxPlayers: 4 },
  { id: 'intermediate', name: 'Клуб "Свраката"', description: 'За играчи със солидни познания. Залозите са по-високи, както и напрежението.', minBet: 50, maxBet: 200, maxPlayers: 6 },
  { id: 'advanced', name: 'VIP Салон', description: 'Само за сериозни играчи. Тук се играе с големи залоzi и безкомпромисни стратегии.', minBet: 100, maxBet: 1000, maxPlayers: 8 },
  { id: 'legendary', name: 'Залата на Легендите', description: 'Най-добрите от най-добрите. Максимални залози и най-високо ниво на игра.', minBet: 500, maxBet: 5000, maxPlayers: 9 },
];

export default function TablesPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [isCreatingLobby, setIsCreatingLobby] = useState<string | null>(null);

  const handleJoinLobby = async (lobbyId: string) => {
    if (!user) {
      router.push('/login?redirect=/tables');
      return;
    }
    setIsCreatingLobby(lobbyId);
    try {
      const createAIGame = httpsCallable(functions, 'createAIGame');
      const result: any = await createAIGame({ lobbyId });
      const { tableId } = result.data;
      router.push(`/play/${tableId}`);
    } catch (error) {
      console.error("Error creating AI game:", error);
      // You could show a toast or an error message here
      setIsCreatingLobby(null);
    }
  };

  if (isAuthLoading) {
    return <div className="text-center p-8">Зареждане...</div>;
  }

  return (
    <div className="container mx-auto p-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary">Избери Своята Игра</h1>
        <p className="text-xl text-muted-foreground mt-2">Намери маса, която отговаря на твоя стил.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {predefinedLobbies.map((lobby) => (
          <Card key={lobby.id} className="bg-card/80 backdrop-blur-sm border-secondary/20 hover:border-primary transition-all flex flex-col">
            <CardHeader>
              <CardTitle>{lobby.name}</CardTitle>
              <CardDescription>{lobby.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end">
                <div className="text-muted-foreground mb-4">
                    <div>Залози: <span className="font-semibold text-secondary">${lobby.minBet} / ${lobby.maxBet}</span></div>
                    <div>Играчи: <span className="font-semibold text-secondary">до {lobby.maxPlayers}</span></div>
                </div>
              <Button 
                onClick={() => handleJoinLobby(lobby.id)} 
                className="w-full"
                disabled={!!isCreatingLobby}
              >
                {isCreatingLobby === lobby.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Създаване...
                  </>
                ) : 'Влез в Масата'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 