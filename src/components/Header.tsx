'use client';

import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const { user, logout, isLoading } = useAuth();
  const [isSheetOpen, setSheetOpen] = useState(false);

  const navLinks = [
    { href: '/play', label: 'Играй' },
    { href: '/rules', label: 'Правила' },
    { href: '/tables', label: 'Маси' },
    { href: '/tournaments', label: 'Турнири' },
    { href: '/users', label: 'Потребители' },
    { href: '/about', label: 'За нас' },
    { href: '/contacts', label: 'Контакти' },
  ];

  return (
    <header className="bg-card border-b border-secondary/20 shadow-lg">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Svarka.bg Logo"
            width={120}
            height={40}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-2">
          {isLoading ? null : user ? (
            <>
              <span className="text-secondary">Здравей, {user.displayName || user.email}!</span>
              <Button onClick={logout} variant="outline">
                Изход
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline">Вход</Button>
              </Link>
              <Link href="/register">
                <Button>Регистрация</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSheetOpen(false)}
                    className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-secondary/20 pt-4">
                  {isLoading ? null : user ? (
                    <div className="flex flex-col space-y-2">
                      <span className="text-secondary">
                        Здравей, {user.displayName || user.email}!
                      </span>
                      <Button onClick={() => { logout(); setSheetOpen(false); }} variant="outline">
                        Изход
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Link href="/login" onClick={() => setSheetOpen(false)}>
                        <Button variant="outline" className="w-full">Вход</Button>
                      </Link>
                      <Link href="/register" onClick={() => setSheetOpen(false)}>
                        <Button className="w-full">Регистрация</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header; 