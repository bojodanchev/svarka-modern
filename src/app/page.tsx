import { Button } from '@/components/ui/button';
import StepCard from '@/components/StepCard';
import { Medal, Dices, Star, Heart, Spade } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <section className="container grid lg:grid-cols-2 place-items-center py-8 md:py-12 gap-10">
        <div className="text-center lg:text-start space-y-6">
          <main className="text-5xl md:text-6xl font-bold">
            <h1 className="inline">
              <span className="inline bg-gradient-to-r from-[#FF0000]  to-[#8B0000] text-transparent bg-clip-text">
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
            src="/card-ball.png"
            alt="Ball of cards"
            width={600}
            height={400}
            className="rounded-lg"
          />
        </div>
      </section>

      <section id="how-to-play" className="container py-8 sm:py-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center">
          Как се играе?
        </h2>
        <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground text-center">
          Следвайте тези три лесни стъпки, за да започнете.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard
            number="1"
            title="Регистрирай се!"
            description="Създайте си безплатен акаунт, за да можете да играете."
            icon={<Heart />}
          />
          <StepCard
            number="2"
            title="Играй Сварка"
            description="Присъединете се към маса или създайте своя собствена."
            icon={<Spade />}
          />
          <StepCard
            number="3"
            title="Печели награди"
            description="Състезавайте се с други играчи и печелете виртуални награди."
            icon={<Star />}
          />
        </div>
      </section>

      <section id="about-us" className="container py-8 sm:py-12">
        <div className="bg-card text-card-foreground p-8 rounded-lg shadow-lg">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">
                Играйте сварка с нас, забавлявайте се с приятели!
              </h2>
              <p className="text-lg text-muted-foreground">
                Сварката е игра на карти, която подхожда на темперамента на
                балканските народи. Изключително развлекателна и емоционална
                игра, в която целта е сборът от картите на един играч да е
                по-голям от този на другите играчи, за да спечели. Блъфовете
                са препоръчителни. Така се изразява чувството за хумор на
                играчите и емоцията е 100%. Играе се сравнително лесно,
                което я прави и толкова популярна.
              </p>
            </div>
            <div className="space-y-4">
              <div className="relative h-48 w-full overflow-hidden rounded-lg">
                <Image
                  src="/poker-chips.png"
                  alt="Poker Chips"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-48 w-full overflow-hidden rounded-lg">
                <Image
                  src="/playing-cards.png"
                  alt="Playing cards"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
