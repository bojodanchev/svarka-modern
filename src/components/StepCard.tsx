import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
}

const StepCard = ({ number, title, description, icon }: StepCardProps) => {
  return (
    <div className="relative flex items-center">
      <div className="z-10 bg-white text-black w-20 h-28 rounded-lg flex flex-col items-center justify-center p-2 shadow-lg">
        <span className="text-3xl font-bold">{number}</span>
        <div className="text-red-600">{icon}</div>
      </div>
      <div className="bg-primary text-primary-foreground p-4 pl-12 -ml-8 rounded-r-lg shadow-md flex-grow">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-primary-foreground/80">{description}</p>
      </div>
    </div>
  );
};

export default StepCard; 