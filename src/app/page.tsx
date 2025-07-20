import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Medal, Dices, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
        <div className="text-center lg:text-start space-y-6">
          <main className="text-5xl md:text-6xl font-bold">
            <h1 className="inline">
              <span className="inline bg-gradient-to-r from-[#F596D3]  to-[#D247BF] text-transparent bg-clip-text">
                Сварка
              </span>{' '}
              Онлайн
            </h1>{' '}
            за модерната епоха
          </main>

          <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
            Класическата българска игра на карти, сега във вашия браузър.
            Играйте с приятели, присъединете се към турнири и се изкачете в
            класацията.
          </p>

          <div className="space-y-4 md:space-y-0 md:space-x-4">
            <Link href="/play">
              <Button className="w-full md:w-1/3">Играй сега</Button>
            </Link>
          </div>
        </div>

        <div className="z-10">
          <Image
            src="https://placehold.co/600x400/000000/FFFFFF?text=Svarka"
            alt="Svarka Game"
            width={600}
            height={400}
            className="rounded-lg"
          />
        </div>
      </section>

      <section id="how-to-play" className="container py-24 sm:py-32">
        <h2 className="text-3xl md:text-4xl font-bold text-center">
          Как се играе?
        </h2>
        <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground text-center">
          Следвайте тези три лесни стъпки, за да започнете.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="grid gap-4 place-items-center">
                <Medal size={48} />
                Регистрирай се!
              </CardTitle>
            </CardHeader>
            <CardContent>
              Създайте си безплатен акаунт, за да можете да играете.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="grid gap-4 place-items-center">
                <Dices size={48} />
                Играй Сварка
              </CardTitle>
            </CardHeader>
            <CardContent>
              Присъединете се към маса или създайте своя собствена.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="grid gap-4 place-items-center">
                <Star size={48} />
                Печели награди
              </CardTitle>
            </CardHeader>
            <CardContent>
              Състезавайте се с други играчи и печелете виртуални награди.
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
