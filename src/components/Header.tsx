import Link from 'next/link';
import { Button } from './ui/button';

const Header = () => {
  return (
    <header className="bg-background border-b shadow-sm">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link
          href="/"
          className="text-4xl font-extrabold tracking-tight text-primary"
        >
          SVarka
        </Link>
        <nav className="flex items-center space-x-6">
          <Link
            href="/play"
            className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Играй
          </Link>
          <Link
            href="/rules"
            className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Правила
          </Link>
          <Link
            href="/tables"
            className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Маси
          </Link>
          <Link
            href="/tournaments"
            className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Турнири
          </Link>
          <Link
            href="/users"
            className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Потребители
          </Link>
          <Link
            href="/about"
            className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            За нас
          </Link>
          <Link
            href="/contacts"
            className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Контакти
          </Link>
          <div className="flex items-center space-x-2">
            <Button variant="outline">Вход</Button>
            <Button>Регистрация</Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header; 