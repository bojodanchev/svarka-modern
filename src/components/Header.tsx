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
            Play
          </Link>
          <Link
            href="/rules"
            className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Rules
          </Link>
          <Link
            href="/about"
            className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            About
          </Link>
          <div className="flex items-center space-x-2">
            <Button variant="outline">Login</Button>
            <Button>Sign Up</Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header; 