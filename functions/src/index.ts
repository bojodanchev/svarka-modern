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
    const uid = request.auth?.uid;
    const { tableId, action } = request.data;

    if (!uid) {
        throw new HttpsError("unauthenticated", "You must be logged in to perform a game action.");
    }
    if (!tableId || !action || !action.type) {
        throw new HttpsError("invalid-argument", "Table ID and a valid action must be provided.");
    }

    const roomRef = db.collection('gameRooms').doc(tableId);

    return db.runTransaction(async (transaction) => {
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists) {
            throw new HttpsError("not-found", "Game room not found.");
        }

        const gameState = roomDoc.data();
        if (!gameState) {
            throw new HttpsError("internal", "Game state is missing.");
        }

        const playerIndex = gameState.players.findIndex((p: Player) => p.id === uid);
        if (playerIndex === -1) {
            throw new HttpsError("failed-precondition", "You are not a player at this table.");
        }

        if (gameState.currentPlayerIndex !== playerIndex && action.type !== 'start_new_round') {
            throw new HttpsError("failed-precondition", "It's not your turn.");
        }
        
        const player = gameState.players[playerIndex];
        
        switch (action.type) {
            case 'fold':
                player.hasFolded = true;
                player.lastAction = 'fold';
                break;
            case 'call':
                const callAmount = gameState.lastBet - player.currentBet;
                if (player.balance < callAmount) throw new HttpsError("failed-precondition", "Insufficient funds to call.");
                player.balance -= callAmount;
                player.currentBet += callAmount;
                gameState.pot += callAmount;
                player.lastAction = 'call';
                break;
            case 'bet':
            case 'raise':
                const betAmount = action.amount;
                if (player.balance < betAmount) throw new HttpsError("failed-precondition", "Insufficient funds to bet/raise.");
                if (betAmount < gameState.lastBet) throw new HttpsError("invalid-argument", "Raise amount must be greater than the last bet.");
                player.balance -= betAmount;
                player.currentBet += betAmount;
                gameState.pot += betAmount;
                gameState.lastBet = player.currentBet;
                player.lastAction = action.type;
                break;
            case 'start_new_round':
                // Reset player states for the new round
                gameState.players.forEach((p: Player) => {
                    p.hand = [];
                    p.currentBet = 0;
                    p.hasFolded = false;
                    p.score = 0;
                    p.lastAction = null;
                });
                // Shuffle and deal new cards
                const deck = shuffleDeck(createDeck());
                gameState.players.forEach((p: Player) => {
                    p.hand = deck.splice(0, 3);
                    p.score = calculateScore(p.hand);
                });
                gameState.phase = 'betting';
                gameState.currentPlayerIndex = 0;
                gameState.pot = 0;
                gameState.lastBet = 0;
                gameState.roundWinner = null;
                break;
            default:
                throw new HttpsError("invalid-argument", "Unknown action type.");
        }

        // Determine next player or end of round
        let nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
        while(gameState.players[nextPlayerIndex].hasFolded) {
            nextPlayerIndex = (nextPlayerIndex + 1) % gameState.players.length;
        }

        const activePlayers = gameState.players.filter((p:Player) => !p.hasFolded);

        if (activePlayers.length === 1) {
            // Everyone else folded, last active player wins
            const winner = activePlayers[0];
            winner.balance += gameState.pot;
            gameState.roundWinner = winner;
            gameState.phase = 'round-over';
        } else if (nextPlayerIndex === gameState.players.findIndex((p:Player) => p.currentBet === gameState.lastBet && !p.hasFolded)) {
             // All active players have matched the last bet, round ends
            let winner = activePlayers[0];
            for (let i = 1; i < activePlayers.length; i++) {
                if (activePlayers[i].score > winner.score) {
                    winner = activePlayers[i];
                }
            }
            winner.balance += gameState.pot;
            gameState.roundWinner = winner;
            gameState.phase = 'round-over';
        } else {
            gameState.currentPlayerIndex = nextPlayerIndex;
        }

        transaction.update(roomRef, gameState);
        return { success: true };
    });
});
