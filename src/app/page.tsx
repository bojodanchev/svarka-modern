import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
      <div className="text-center lg:text-start space-y-6">
        <main className="text-5xl md:text-6xl font-bold">
          <h1 className="inline">
            <span className="inline bg-gradient-to-r from-[#F596D3]  to-[#D247BF] text-transparent bg-clip-text">
              Svarka
            </span>{' '}
            Online
          </h1>{' '}
          for the modern an age
        </main>

        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
          The classic Bulgarian card game, now in your browser. Play with
          friends, join tournaments, and climb the leaderboard.
        </p>

        <div className="space-y-4 md:space-y-0 md:space-x-4">
          <Link href="/play">
            <Button className="w-full md:w-1/3">Play Now</Button>
          </Link>
        </div>
      </div>

      {/* Hero cards sections */}
      <div className="z-10"></div>
    </section>
  );
}
