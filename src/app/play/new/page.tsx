import { Suspense } from 'react';
import NewGameInitializer from '@/components/NewGameInitializer';

const Loading = () => (
    <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Подготвяме масата...</div>
    </div>
);

export default function PlayPage() {
  return (
    <Suspense fallback={<Loading />}>
      <NewGameInitializer />
    </Suspense>
  );
} 