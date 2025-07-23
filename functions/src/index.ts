/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

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


// --- AI Logic ---
const aiNames = ["Мария", "Петър", "Георги", "Иван", "Елена", "Димитър", "София", "Никола"];

const makeAIMove = (player: Player, gameState: any): any => {
    const score = player.score;
    if (score > 20 && Math.random() > 0.4) {
        const raiseAmount = Math.min(player.balance, gameState.lastBet + 20 + Math.floor(Math.random() * 30));
        if (raiseAmount > gameState.lastBet) return { type: 'raise', amount: raiseAmount };
    }
    if (score > 14 && Math.random() > 0.3) {
        if (gameState.lastBet > 0) return { type: 'call' };
        return { type: 'bet', amount: Math.min(player.balance, 10) };
    }
    if (gameState.lastBet > player.balance * 0.3 && Math.random() > 0.5) {
        return { type: 'fold' };
    }
    return { type: 'call' };
};


export const createAIGame = onCall(async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "You must be logged in to create a game.");
    
    const { lobbyId } = request.data;
    if (!lobbyId) throw new HttpsError("invalid-argument", "Lobby ID must be provided.");

    const lobbies: any = {
      'beginner': { name: 'Маса за Начинаещи', minBet: 10, maxBet: 50, maxPlayers: 4 },
      'intermediate': { name: 'Клуб "Свраката"', minBet: 50, maxBet: 200, maxPlayers: 6 },
      'advanced': { name: 'VIP Салон', minBet: 100, maxBet: 1000, maxPlayers: 8 },
      'legendary': { name: 'Залата на Легендите', minBet: 500, maxBet: 5000, maxPlayers: 9 },
    };
    const lobby = lobbies[lobbyId];
    if (!lobby) throw new HttpsError("not-found", "Lobby not found.");

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) throw new HttpsError("not-found", "User not found.");
    const userData = userDoc.data();
    
    const humanPlayer: Player = {
        id: uid,
        name: userData?.username || 'Играч',
        hand: [],
        balance: userData?.balance || 1000,
        currentBet: 0, hasFolded: false, isAI: false, score: 0, lastAction: null
    };

    const numAIPlayers = Math.floor(Math.random() * (lobby.maxPlayers - 2)) + 1;
    const players: Player[] = [humanPlayer];
    const usedNames = new Set([humanPlayer.name]);

    for (let i = 0; i < numAIPlayers; i++) {
        let aiName = aiNames[Math.floor(Math.random() * aiNames.length)];
        while(usedNames.has(aiName)) {
            aiName = aiNames[Math.floor(Math.random() * aiNames.length)];
        }
        usedNames.add(aiName);
        players.push({
            id: `ai_${i}_${Date.now()}`, name: aiName,
            hand: [], balance: 1000,
            currentBet: 0, hasFolded: false, isAI: true, score: 0, lastAction: null
        });
    }

    const deck = shuffleDeck(createDeck());
    players.forEach(p => {
        p.hand = deck.splice(0, 3);
        p.score = calculateScore(p.hand);
    });
    
    const newRoom = {
        name: lobby.name,
        players: players,
        playersCount: players.length,
        maxPlayers: lobby.maxPlayers,
        minBet: lobby.minBet,
        maxBet: lobby.maxBet,
        createdBy: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        phase: 'betting',
        currentPlayerIndex: 0,
        pot: 0,
        lastBet: 0,
        roundWinner: null
    };

    const roomRef = await db.collection('gameRooms').add(newRoom);
    
    return { tableId: roomRef.id };
});

export const gameAction = onCall(async (request) => {
    const uid = request.auth?.uid;
    const { tableId, action } = request.data;

    if (!uid) throw new HttpsError("unauthenticated", "You must be logged in.");
    if (!tableId || !action || !action.type) throw new HttpsError("invalid-argument", "Table ID and action are required.");

    const roomRef = db.collection('gameRooms').doc(tableId);

    return db.runTransaction(async (transaction) => {
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists) throw new HttpsError("not-found", "Game room not found.");

        const gameState = roomDoc.data();
        if (!gameState) throw new HttpsError("internal", "Game state is missing.");
        
        if (action.type === 'start_new_round') {
            if (gameState.phase !== 'round-over') throw new HttpsError("failed-precondition", "Cannot start a new round yet.");
            
            gameState.players.forEach((p: Player) => {
                p.hand = []; p.currentBet = 0; p.hasFolded = false; p.score = 0; p.lastAction = null;
            });
            const deck = shuffleDeck(createDeck());
            gameState.players.forEach((p: Player) => {
                if (p.balance > 0) {
                    p.hand = deck.splice(0, 3);
                    p.score = calculateScore(p.hand);
                }
            });
            gameState.phase = 'betting';
            gameState.currentPlayerIndex = 0;
            gameState.pot = 0;
            gameState.lastBet = 0;
            gameState.roundWinner = null;

        } else {
            const playerIndex = gameState.players.findIndex((p: Player) => p.id === uid);
            if (playerIndex === -1) throw new HttpsError("failed-precondition", "You are not a player.");
            if (gameState.currentPlayerIndex !== playerIndex) throw new HttpsError("failed-precondition", "It's not your turn.");
            
            processPlayerMove(gameState.players[playerIndex], action, gameState);
            
            gameState.currentPlayerIndex = (playerIndex + 1) % gameState.players.length;

            let currentTurn = 0;
            const maxTurns = gameState.players.length * 2;

            while (currentTurn < maxTurns && gameState.players[gameState.currentPlayerIndex].isAI && gameState.phase === 'betting') {
                const aiPlayer = gameState.players[gameState.currentPlayerIndex];
                if (!aiPlayer.hasFolded) {
                    const aiAction = makeAIMove(aiPlayer, gameState);
                    processPlayerMove(aiPlayer, aiAction, gameState);
                }
                
                if (await checkAndFinalizeRound(gameState, transaction)) break;
                
                gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
                currentTurn++;
            }
        }
        
        await checkAndFinalizeRound(gameState, transaction);

        transaction.update(roomRef, gameState);
        return { success: true };
    });
});

const processPlayerMove = (player: Player, move: any, gameState: any) => {
    player.lastAction = move.type;
    switch (move.type) {
        case 'fold':
            player.hasFolded = true;
            break;
        case 'call':
            const callAmount = gameState.lastBet - player.currentBet;
            const amountToCall = Math.min(callAmount, player.balance);
            player.balance -= amountToCall;
            player.currentBet += amountToCall;
            gameState.pot += amountToCall;
            break;
        case 'bet':
        case 'raise':
            const totalBet = move.amount;
            const requiredAmount = totalBet - player.currentBet;
            
            if (requiredAmount <= 0) return;
            if (totalBet < gameState.lastBet) return;

            const amountToBet = Math.min(requiredAmount, player.balance);
            player.balance -= amountToBet;
            player.currentBet += amountToBet;
            gameState.pot += amountToBet;
            gameState.lastBet = player.currentBet;
            break;
    }
}

const checkAndFinalizeRound = async (gameState: any, transaction: admin.firestore.Transaction): Promise<boolean> => {
    if (gameState.phase === 'round-over') return true;

    const activePlayers = gameState.players.filter((p: Player) => !p.hasFolded && p.balance > 0);
    if (activePlayers.length === 0) {
        gameState.phase = 'round-over';
        return true;
    }
    
    const allPlayersActed = activePlayers.every((p: Player) => p.lastAction !== null);
    const allBetsEqual = allPlayersActed && activePlayers.every((p: Player) => p.currentBet === gameState.lastBet);

    if (activePlayers.length === 1 || (allBetsEqual && gameState.lastBet > 0)) {
        gameState.phase = 'round-over';
        const winner = activePlayers.reduce((best: Player, current: Player) => current.score > best.score ? current : best, activePlayers[0]);
        
        if (winner) {
            gameState.roundWinner = { id: winner.id, name: winner.name, hand: winner.hand, score: winner.score };
            if (!winner.isAI) {
                const winnerRef = db.collection('users').doc(winner.id);
                const winnerDoc = await transaction.get(winnerRef);
                if (winnerDoc.exists) {
                    const winnerData = winnerDoc.data();
                    transaction.update(winnerRef, { balance: (winnerData?.balance || 0) + gameState.pot });
                }
            } else {
                 const winnerInState = gameState.players.find((p: Player) => p.id === winner.id);
                 if(winnerInState) winnerInState.balance += gameState.pot;
            }
        }
        return true;
    }
    return false;
};
