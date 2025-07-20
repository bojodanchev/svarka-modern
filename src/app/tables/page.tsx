import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

interface GameTable {
  id: number;
  name: string;
  players: number;
  maxPlayers: number;
  minBet: number;
  maxBet: number;
}

const mockTables: GameTable[] = [
  { id: 1, name: 'Маса за начинаещи', players: 2, maxPlayers: 4, minBet: 10, maxBet: 50 },
  { id: 2, name: 'Маса за напреднали', players: 3, maxPlayers: 6, minBet: 50, maxBet: 200 },
  { id: 3, name: 'VIP Маса', players: 1, maxPlayers: 2, minBet: 100, maxBet: 1000 },
  { id: 4, name: 'Бърза игра', players: 4, maxPlayers: 4, minBet: 20, maxBet: 100 },
];

const TablesPage = () => {
  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-4xl font-extrabold text-center mb-6">Маси за игра</h1>
      <div className="max-w-4xl mx-auto bg-card text-card-foreground p-8 rounded-lg shadow-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Име на масата</TableHead>
              <TableHead>Играчи</TableHead>
              <TableHead>Мин./Макс. залог</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTables.map(table => (
              <TableRow key={table.id}>
                <TableCell className="font-medium">{table.name}</TableCell>
                <TableCell>
                  {table.players} / {table.maxPlayers}
                </TableCell>
                <TableCell>
                  {table.minBet} / {table.maxBet}
                </TableCell>
                <TableCell className="text-right">
                  <Link href="/play">
                    <Button variant="outline" className="mr-2">
                      Отвори
                    </Button>
                  </Link>
                  <Link href="/play">
                    <Button>Влез</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TablesPage; 