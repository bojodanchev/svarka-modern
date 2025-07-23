import { Card } from './types';

export const calculateScore = (hand: Card[]): number => {
  let score = 0;
  const rankValues: { [key in Card['rank']]: number } = {
    '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11,
  };
  for (const card of hand) {
    score += rankValues[card.rank];
  }
  return score;
}; 