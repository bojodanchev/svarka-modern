import { Card } from './types';

const CHECHAK_SUIT = '♠';
const CHECHAK_RANK = '7';

/**
 * Returns the point value of a single card.
 * @param {Card} card The card to evaluate.
 * @returns {number} The point value of the card.
 */
const getCardValue = (card: Card): number => {
  if (!card) return 0;
  if (card.rank === 'A') return 11;
  if (['K', 'Q', 'J', '10'].includes(card.rank)) return 10;
  return parseInt(card.rank, 10);
};

/**
 * Checks if a card is the Chechak (7 of Spades).
 * @param {Card} card The card to check.
 * @returns {boolean} True if the card is Chechak.
 */
const isChechak = (card: Card): boolean =>
  card && card.suit === CHECHAK_SUIT && card.rank === CHECHAK_RANK;

/**
 * Calculates the score of a 3-card hand in Svarka.
 * The logic follows the specified evaluation hierarchy.
 * @param {Card[]} hand - An array of 3 card objects.
 * @returns {number} The calculated score of the hand.
 */
export const calculateHandScore = (hand: Card[]): number => {
  if (!hand || hand.length !== 3) {
    return 0;
  }

  // --- 1. Check for Special Highest-Tier Hands ---
  const hasThreeAces = hand.every((card) => card.rank === 'A');
  if (hasThreeAces) {
    return 33;
  }

  const chechakInHand = hand.find(isChechak);
  const sevens = hand.filter((c) => c.rank === '7');
  if (sevens.length === 3 && chechakInHand) {
    return 32.5;
  }

  // --- 2. Evaluate Combinations (Three of a kind & Flushes) ---

  // Handle combinations with Chechak as a wildcard
  if (chechakInHand) {
    const otherCards = hand.filter((c) => !isChechak(c));
    const [card1, card2] = otherCards;

    // Check for Three of a Kind with Chechak (e.g., K, K, Chechak)
    if (card1.rank === card2.rank) {
      return getCardValue(card1) * 3;
    }

    // Check for Flush with Chechak (e.g., K♥, Q♥, Chechak)
    if (card1.suit === card2.suit) {
      return 11 + getCardValue(card1) + getCardValue(card2);
    }

    // If no other combo, Chechak adds to the highest other card
    return 11 + Math.max(getCardValue(card1), getCardValue(card2));
  }

  // Check for Three of a Kind (without Chechak)
  const isThreeOfAKind =
    hand[0].rank === hand[1].rank && hand[1].rank === hand[2].rank;
  if (isThreeOfAKind) {
    return getCardValue(hand[0]) * 3;
  }

  // Check for Flush (without Chechak)
  const isFlush =
    hand[0].suit === hand[1].suit && hand[1].suit === hand[2].suit;
  if (isFlush) {
    return hand.reduce((sum, card) => sum + getCardValue(card), 0);
  }

  // --- 3. Evaluate Two-Card Combinations (Pairs) ---
  const rankCounts: { [key: string]: number } = {};
  hand.forEach((card) => {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
  });

  for (const rank in rankCounts) {
    if (rankCounts[rank] === 2) {
      const pairCard = hand.find((c) => c.rank === rank)!;
      return getCardValue(pairCard) * 2; // e.g., A, A, 10 -> 22
    }
  }

  // --- 4. Evaluate Two-Card Same-Suit Groups ---
  const suitCounts: { [key: string]: number } = {};
  hand.forEach((card) => {
    suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
  });

  for (const suit in suitCounts) {
    if (suitCounts[suit] === 2) {
      const sameSuitCards = hand.filter((c) => c.suit === suit);
      return getCardValue(sameSuitCards[0]) + getCardValue(sameSuitCards[1]);
    }
  }

  // --- 5. Default to the single highest card value ---
  return Math.max(...hand.map(getCardValue));
};
