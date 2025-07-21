'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface GameTable {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  minBet: number;
  maxBet: number;
}

const mockTables: GameTable[] = [
  { id: 'beginners', name: 'Маса за начинаещи', players: 2, maxPlayers: 4, minBet: 10, maxBet: 50 },
  { id: 'advanced', name: 'Маса за напреднали', players: 3, maxPlayers: 6, minBet: 50, maxBet: 200 },
  { id: 'vip', name: 'VIP Маса', players: 1, maxPlayers: 2, minBet: 100, maxBet: 1000 },
  { id: 'fast', name: 'Бърза игра', players: 4, maxPlayers: 4, minBet: 20, maxBet: 100 },
];

const TablesPage = () => {
  return (
    <div className="container mx-auto p-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold text-center mb-8 text-primary">Маси за игра</h1>
      <div className="max-w-5xl mx-auto space-y-4">
        {mockTables.map(table => (
          <Card key={table.id} className="bg-card/80 backdrop-blur-sm border-secondary/20 hover:border-primary transition-all">
            <div className="grid grid-cols-2 md:grid-cols-4 items-center p-4 gap-4">
              <div className="font-medium text-lg">{table.name}</div>
              <div className="text-muted-foreground">
                <span className="font-semibold">{table.players}</span> / {table.maxPlayers} играчи
              </div>
              <div className="text-muted-foreground">
                <span className="font-semibold">${table.minBet}</span> / ${table.maxBet}
              </div>
              <div className="flex justify-end space-x-2">
                <Link href={`/play/${table.id}?minBet=${table.minBet}&maxBet=${table.maxBet}`}>
                  <Button variant="outline">Отвори</Button>
                </Link>
                <Link href={`/play/${table.id}?minBet=${table.minBet}&maxBet=${table.maxBet}`}>
                  <Button>Влез</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TablesPage; 