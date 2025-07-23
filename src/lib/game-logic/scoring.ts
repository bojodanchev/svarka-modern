import { Card } from './types';

type HandEvaluation = {
  rank: number; // 0: High Card, 1: Pair, 2: Triple, 3: Svarka
  score: number;
  description: string;
};

const getCardValue = (card: Card, isJoker: boolean = false): number => {
  if (isJoker) return 11;
  const rank = card.rank;
  if (['7', '8', '9'].includes(rank)) return parseInt(rank, 10);
  if (['10', 'J', 'Q', 'K'].includes(rank)) return 10;
  if (rank === 'A') return 11;
  return 0;
};

const getRankName = (rank: Card['rank']): string => {
    const names = { '7': 'Седмица', '8': 'Осмица', '9': 'Девятка', '10': 'Десятка', 'J': 'Вале', 'Q': 'Дама', 'K': 'Поп', 'A': 'Асо' };
    return names[rank];
}

export const evaluateHand = (hand: Card[]): HandEvaluation => {
  if (hand.length !== 3) {
    return { rank: 0, score: 0, description: "Невалидна ръка" };
  }

  const is7ClubJoker = hand.some(c => c.rank === '7' && c.suit === '♣');
  
  // 1. Check for Svarka (Flush)
  const suits = hand.map(c => c.suit);
  const isFlush = new Set(suits).size === 1;

  if (isFlush || is7ClubJoker) {
    let score = hand.reduce((acc, card) => acc + getCardValue(card, card.rank === '7' && card.suit === '♣'), 0);
    return { rank: 3, score, description: "Сварка" };
  }

  // 2. Check for Triple (Three of a Kind)
  const ranks = hand.map(c => c.rank);
  const isTriple = new Set(ranks).size === 1;
  if (isTriple) {
    const score = hand.reduce((acc, card) => acc + getCardValue(card), 0);
    return { rank: 2, score, description: `Три ${getRankName(ranks[0])}и` };
  }

  // 3. Check for Pair
  const rankCounts: { [key: string]: number } = {};
  for(const rank of ranks) {
    rankCounts[rank] = (rankCounts[rank] || 0) + 1;
  }
  const pairRank = Object.keys(rankCounts).find(r => rankCounts[r] === 2);

  if (pairRank) {
    const pairValue = getCardValue({ rank: pairRank as Card['rank'], suit: '♠' });
    const score = pairValue * 2;
    return { rank: 1, score, description: `Чифт ${getRankName(pairRank as Card['rank'])}` };
  }

  // 4. High Card
  let bestCard = hand[0];
  let maxScore = getCardValue(bestCard);
  for (let i = 1; i < hand.length; i++) {
    const currentScore = getCardValue(hand[i]);
    if (currentScore > maxScore) {
      maxScore = currentScore;
      bestCard = hand[i];
    }
  }

  return { rank: 0, score: maxScore, description: `Висока карта ${getRankName(bestCard.rank)}` };
}; 