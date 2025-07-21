/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Type definitions - these should mirror the ones on the client
interface Card {
    suit: '♠' | '♥' | '♦' | '♣';
    rank: '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
}

interface Player {
    id: string;
    name: string;
    hand: Card[];
    balance: number;
    currentBet: number;
    hasFolded: boolean;
    isAI: boolean;
    score: number;
    lastAction: any;
}

// --- Game Logic ---

const createDeck = (): Card[] => {
    const suits: Card['suit'][] = ['♠', '♥', '♦', '♣'];
    const ranks: Card['rank'][] = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck: Card[] = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ suit, rank });
        }
    }
    return deck;
};

const shuffleDeck = (deck: Card[]): Card[] => {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
};

const calculateScore = (hand: Card[]): number => {
    let score = 0;
    const rankValues: { [key in Card['rank']]: number } = {
        '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11,
    };
    for (const card of hand) {
        score += rankValues[card.rank];
    }
    return score;
};


export const joinGame = onCall(async (request) => {
    const uid = request.auth?.uid;
    const { tableId } = request.data;

    if (!uid) {
        throw new HttpsError("unauthenticated", "You must be logged in to join a game.");
    }
    if (!tableId) {
        throw new HttpsError("invalid-argument", "Table ID must be provided.");
    }

    const roomRef = db.collection('gameRooms').doc(tableId);
    const userRef = db.collection('users').doc(uid);

    return db.runTransaction(async (transaction) => {
        const roomDoc = await transaction.get(roomRef);
        const userDoc = await transaction.get(userRef);

        if (!roomDoc.exists || !userDoc.exists) {
            throw new HttpsError("not-found", "Game room or user not found.");
        }

        const roomData = roomDoc.data();
        const userData = userDoc.data();
        const players = roomData?.players || [];

        if (players.length >= roomData?.maxPlayers) {
            throw new HttpsError("failed-precondition", "This table is full.");
        }
        if (players.some((p: Player) => p.id === uid)) {
            logger.info("User already in game, returning.");
            return { success: true, message: "Already in game." };
        }

        const newPlayer: Player = {
            id: uid,
            name: userData?.username || 'Guest',
            hand: [],
            balance: userData?.balance || 1000,
            currentBet: 0,
            hasFolded: false,
            isAI: false,
            score: 0,
            lastAction: null
        };

        players.push(newPlayer);
        transaction.update(roomRef, { players, playersCount: players.length });
        
        // If the room is now full, start the game
        if (players.length === roomData?.maxPlayers) {
             const deck = shuffleDeck(createDeck());
             players.forEach((p: Player) => {
                p.hand = deck.splice(0, 3);
                p.score = calculateScore(p.hand);
             });
            transaction.update(roomRef, { 
                players, 
                gameState: 'betting', 
                currentPlayerIndex: 0,
                pot: 0,
                lastBet: 0,
            });
        }


        return { success: true };
    });
});

export const gameAction = onCall(async (request) => {
    // This function will contain the logic for bet, call, fold, raise, etc.
    // It will be more complex and will involve updating the game state
    // based on the action and the current state.
    
    // For now, let's log the action
    logger.info("Game action received:", request.data);
    
    // In a real implementation, you would:
    // 1. Get the game room document.
    // 2. Validate the action (is it the player's turn? is the bet valid?).
    // 3. Update the game state (player's bet, pot, next player's turn, etc.).
    // 4. Check if the round is over and determine a winner.
    // 5. Save the new game state back to Firestore.

    return { success: true, message: "Action logged." };
});
