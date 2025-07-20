import { Card, Rank } from './types';

const getCardValue = (card: Card): number => {
  const rank = card.rank;
  if (rank === 'A') return 11;
  if (['K', 'Q', 'J', '10'].includes(rank)) return 10;
  return parseInt(rank, 10);
};

const isChechak = (card: Card): boolean => {
    return card.suit === '♣' && card.rank === '7';
}

export const calculateHandScore = (hand: Card[]): number => {
  if (hand.length !== 3) {
    return 0;
  }

  const chechakInHand = hand.find(isChechak);

  // Rule: Three Aces
  if (hand.every(card => card.rank === 'A')) {
    return 33;
  }

  // Rule: Three 7s with Chechak
  const sevens = hand.filter(c => c.rank === '7');
  if (sevens.length === 3 && chechakInHand) {
      return 32.5;
  }
  
  // Rule: Three of a kind (non-Aces)
  if (hand[0].rank === hand[1].rank && hand[1].rank === hand[2].rank) {
    return getCardValue(hand[0]) * 3;
  }
  
  // Rule: 7♣, K♥, K♦ -> 31 points.
  const kings = hand.filter(c => c.rank === 'K');
  if (chechakInHand && kings.length === 2 && new Set(kings.map(k => k.suit)).size === 2) {
    return 31;
  }
  
  // Rule: 7♣, А♥, K♥ -> 32 points.
  const hasAce = hand.some(c => c.rank === 'A');
  const hasKing = hand.some(c => c.rank === 'K');
  
  if (chechakInHand && hasAce && hasKing) {
      const nonChechakCards = hand.filter(c => !isChechak(c));
      if (nonChechakCards[0].suit === nonChechakCards[1].suit) {
          return 32;
      }
  }

  // Rule: Three of a kind of Queens, Kings, or 10s is called "Bomb" and is worth 30 points
  const isBomb = hand.every(c => ['Q', 'K', '10'].includes(c.rank)) && hand[0].rank === hand[1].rank && hand[1].rank === hand[2].rank;
  if (isBomb) {
      return 30;
  }

  // Rule: Any three cards of the same suit are a "Flush"
  const isFlush = hand.every(c => c.suit === hand[0].suit);
  if (isFlush) {
      return hand.reduce((sum, card) => sum + getCardValue(card), 0);
  }

  // Same suit combinations
  const suits = hand.map(card => card.suit);
  const isSameSuit = new Set(suits).size === 1;
  if (isSameSuit) {
    return hand.reduce((sum, card) => sum + getCardValue(card), 0);
  }

  if (chechakInHand) {
    const otherCards = hand.filter(c => !isChechak(c));
    const [card1, card2] = otherCards;
    if (card1.suit === card2.suit) {
        return getCardValue(card1) + getCardValue(card2) + 11;
    }
    const maxOtherCard = getCardValue(card1) > getCardValue(card2) ? card1 : card2;
    return getCardValue(maxOtherCard) + 11;
  }
  
  // Combinations of 2 cards with same suit
  if (hand[0].suit === hand[1].suit) {
      return getCardValue(hand[0]) + getCardValue(hand[1]);
  }
  if (hand[0].suit === hand[2].suit) {
      return getCardValue(hand[0]) + getCardValue(hand[2]);
  }
  if (hand[1].suit === hand[2].suit) {
      return getCardValue(hand[1]) + getCardValue(hand[2]);
  }

  // Pairs
  if (hand[0].rank === hand[1].rank) return getCardValue(hand[0]) * 2;
  if (hand[0].rank === hand[2].rank) return getCardValue(hand[0]) + getCardValue(hand[2]);
  if (hand[1].rank === hand[2].rank) return getCardValue(hand[1]) + getCardValue(hand[2]);

  // Highest card
  return Math.max(...hand.map(getCardValue));
}; 