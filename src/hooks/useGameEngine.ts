'use client';

import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, PlayerAction } from '@/lib/game-logic/types';
import { shuffleDeck, createDeck } from '@/lib/game-logic/deck';
import { evaluateHand } from '@/lib/game-logic/scoring';

const makeAIMove = (player: Player, gameState: GameState): PlayerAction => {
    const { handScore, handRank, balance, currentBet } = player;
    const { lastBet, minBet } = gameState;
    const costToCall = lastBet - currentBet;

    // --- Strong Hand (Svarka or Triple) ---
    if (handRank > 1) { // Rank 2 (Triple) or 3 (Svarka)
        if (Math.random() < 0.8) { // 80% chance to be aggressive
            const raiseAmount = lastBet + (minBet || 10) * (Math.random() > 0.5 ? 2 : 1);
            if (balance >= (raiseAmount - currentBet)) {
                return { type: 'raise', amount: raiseAmount };
            }
        }
        if (costToCall > 0 && balance >= costToCall) return { type: 'call' };
        return { type: 'check' };
    }

    // --- Medium Hand (Pair > 16) ---
    if (handRank === 1 && handScore > 16) {
        if (costToCall > 0 && Math.random() < 0.6) { // 60% chance to call
            if (balance >= costToCall) return { type: 'call' };
        }
        if (costToCall > 0) return { type: 'fold' };
        return { type: 'check' };
    }

    // --- Weak Hand ---
    if (lastBet > 0) {
        if (Math.random() < 0.1 && balance >= costToCall) return { type: 'call' }; // 10% bluff call
        return { type: 'fold' };
    }
    return { type: 'check' };
};

const getNextActivePlayerIndex = (state: GameState, startIndex: number): number => {
    let nextIndex = (startIndex + 1) % state.players.length;
    let guard = 0; // Failsafe to prevent infinite loops if all are folded
    while(state.players[nextIndex].hasFolded && guard < state.players.length * 2) {
        nextIndex = (nextIndex + 1) % state.players.length;
        guard++;
    }
    return nextIndex;
};

export const useGameEngine = (initialState: GameState, user: any) => {
    const [gameState, setGameState] = useState<GameState>(initialState);
    const [isProcessing, setIsProcessing] = useState(false);

    const processMove = useCallback((state: GameState, playerIndex: number, move: PlayerAction): GameState => {
        let newState = JSON.parse(JSON.stringify(state));
        const player = newState.players[playerIndex];
        if (!player || player.hasFolded) return newState;

        player.lastAction = move.type;
        player.actedInRound = true;

        switch (move.type) {
            case 'fold':
                player.hasFolded = true;
                break;
            case 'call':
                const callAmount = newState.lastBet - player.currentBet;
                if (callAmount > 0) {
                    const amountToCall = Math.min(callAmount, player.balance);
                    player.balance -= amountToCall;
                    player.currentBet += amountToCall;
                    newState.pot += amountToCall;
                }
                break;
            case 'bet':
            case 'raise':
                const isRaise = newState.lastBet > 0;
                const totalBet = move.amount || 0;
                const requiredAmount = totalBet - player.currentBet;
                
                if (requiredAmount > 0 && totalBet >= newState.lastBet && player.balance >= requiredAmount) {
                    player.balance -= requiredAmount;
                    player.currentBet += requiredAmount;
                    newState.pot += requiredAmount;
                    newState.lastBet = player.currentBet;
                    // If a player raises, everyone else needs to act again
                    if(isRaise) {
                        newState.players.forEach((p: Player) => {
                            if (p.id !== player.id && !p.hasFolded) {
                                p.actedInRound = false;
                            }
                        });
                    }
                }
                break;
            case 'check':
                break;
        }

        const roundOverState = checkAndFinalizeRound(newState);
        if (roundOverState.phase !== 'betting') return roundOverState;
        
        roundOverState.currentPlayerIndex = getNextActivePlayerIndex(roundOverState, playerIndex);
        
        return roundOverState;
    }, []);

    const handlePlayerAction = useCallback((action: PlayerAction) => {
        if (isProcessing || gameState.phase !== 'betting') return;
        const playerIndex = gameState.players.findIndex(p => p.id === user.uid);
        if (playerIndex === -1 || gameState.currentPlayerIndex !== playerIndex) return;
        
        setIsProcessing(true);
        const newState = processMove(gameState, playerIndex, action);
        setGameState(newState);
    }, [gameState, user, isProcessing, processMove]);

    useEffect(() => {
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        if (gameState.phase === 'betting' && currentPlayer && currentPlayer.isAI && !currentPlayer.hasFolded) {
            const timeoutId = setTimeout(() => {
                const aiAction = makeAIMove(currentPlayer, gameState);
                const newState = processMove(gameState, gameState.currentPlayerIndex, aiAction);
                setGameState(newState);
            }, 3000); // AI "thinking" time
            return () => clearTimeout(timeoutId);
        } else {
             setIsProcessing(false);
        }
    }, [gameState, processMove]);
    

    const checkAndFinalizeRound = (state: GameState): GameState => {
        const activePlayers = state.players.filter(p => !p.hasFolded);
        
        if (activePlayers.length <= 1) {
            state.phase = 'round-over';
            const winner = activePlayers[0];
            if (winner) {
                const winnerInState = state.players.find(p => p.id === winner.id)!;
                winnerInState.balance += state.pot;
                state.roundWinner = { id: winner.id, name: winner.name, hand: winner.hand, score: winner.handScore, description: "Всички други се отказаха" };
            }
            return state;
        }

        const allHaveActed = activePlayers.every(p => p.actedInRound);
        const allBetsEqual = new Set(activePlayers.map(p => p.currentBet)).size === 1;

        if (allHaveActed && allBetsEqual && state.lastBet > 0) {
            
            activePlayers.forEach(p => {
                const evaluation = evaluateHand(p.hand);
                p.handScore = evaluation.score;
                p.handRank = evaluation.rank;
                p.handDescription = evaluation.description;
            });

            const sortedPlayers = [...activePlayers].sort((a, b) => {
                if (b.handRank !== a.handRank) return b.handRank - a.handRank;
                return b.handScore - a.handScore;
            });
            
            const winner = sortedPlayers[0];
            const tiedPlayers = sortedPlayers.filter(p => p.handRank === winner.handRank && p.handScore === winner.handScore);

            if (tiedPlayers.length > 1) {
                state.phase = 'tie-break';
                state.tiedPlayerIds = tiedPlayers.map(p => p.id);
                state.roundWinner = null;
            } else {
                state.phase = 'round-over';
                if (winner) {
                    const winnerInState = state.players.find(p => p.id === winner.id)!;
                    winnerInState.balance += state.pot;
                    state.roundWinner = { id: winner.id, name: winner.name, hand: winner.hand, score: winner.handScore, description: winner.handDescription };
                }
            }
        }
        return state;
    };
    
    const handlePlayerRejoin = () => {
        setGameState(prev => {
            let newState = JSON.parse(JSON.stringify(prev));
            const player = newState.players.find((p: Player) => p.id === user.uid);
            if (player && !player.isReadyForNextRound) {
                player.isReadyForNextRound = true;
                if (!newState.tiedPlayerIds?.includes(player.id)) {
                    player.balance -= newState.minBet;
                    newState.pot += newState.minBet;
                }
            }
            // All necessary players are now ready, start the round
            return startNewRound(newState, true);
        });
    };
    
    const handleStartNextRoundWithoutPlayer = () => {
        setGameState(prev => {
            let newState = JSON.parse(JSON.stringify(prev));
            const player = newState.players.find((p: Player) => p.id === user.uid);
            if (player) {
                player.isReadyForNextRound = false;
            }
            return startNewRound(newState, true);
        });
    };

    useEffect(() => {
        // This effect automatically handles AI and tied player decisions for a tie-break
        if (gameState.phase === 'tie-break' && user) {
            let newState = JSON.parse(JSON.stringify(gameState));
            let processed = false;

            newState.players.forEach((p: Player) => {
                if (p.isReadyForNextRound) return; // Already processed

                if (newState.tiedPlayerIds?.includes(p.id)) {
                    p.isReadyForNextRound = true;
                    processed = true;
                } else if (p.isAI) {
                    if (p.balance >= newState.minBet && p.balance > newState.pot) { // AI rejoins if it has a good balance
                        p.balance -= newState.minBet;
                        newState.pot += newState.minBet;
                        p.isReadyForNextRound = true;
                    } else {
                        p.isReadyForNextRound = false; // AI folds
                    }
                    processed = true;
                }
            });

            if (processed) {
                const humanPlayer = newState.players.find((p: Player) => p.id === user.uid);
                // If human was in the tie or folded, the round can start right away
                if (humanPlayer && humanPlayer.isReadyForNextRound !== false) {
                     const allOthersReady = newState.players.filter((p: Player) => p.id !== user.uid).every((p: Player) => p.isReadyForNextRound !== undefined);
                     if(allOthersReady) {
                         // Awaiting human action, just update the state
                         setGameState(newState);
                         return;
                     }
                }
                
                // If the game can proceed without human input, start new round
                const nonHumanPlayers = newState.players.filter((p: Player) => p.id !== user.uid);
                const allAIsReady = nonHumanPlayers.every((p: Player) => p.isReadyForNextRound !== undefined);
                const humanNotInTie = humanPlayer && !newState.tiedPlayerIds?.includes(humanPlayer.id);

                if (allAIsReady && !humanNotInTie) {
                    setGameState(startNewRound(newState, true));
                } else {
                    setGameState(newState);
                }
            }
        }
    }, [gameState.phase, user]);


    const startNewRound = (currentState?: GameState, isTieBreaker = false) => {
        const roundStarter = (prev: GameState) => {
            let stateToStartFrom = currentState || prev;
            let newState = JSON.parse(JSON.stringify(stateToStartFrom));
            
            if (!isTieBreaker) {
                newState.pot = 0;
            }

            const deck = shuffleDeck(createDeck());
            newState.players.forEach((p: Player) => {
                const canPlay = isTieBreaker ? p.isReadyForNextRound : p.balance > 0;

                if (canPlay) {
                    p.hand = deck.splice(0, 3);
                    const evaluation = evaluateHand(p.hand);
                    p.handScore = evaluation.score;
                    p.handRank = evaluation.rank;
                    p.handDescription = evaluation.description;
                    p.hasFolded = false;
                } else {
                    p.hasFolded = true;
                    p.hand = [];
                }
                p.currentBet = 0;
                p.lastAction = null;
                p.isReadyForNextRound = false;
                p.actedInRound = false;
            });

            newState.phase = 'betting';
            newState.currentPlayerIndex = 0;
            newState.lastBet = 0;
            newState.roundWinner = null;
            newState.tiedPlayerIds = [];
            return newState;
        }

        if(currentState) {
            return roundStarter(currentState);
        } else {
            setGameState(roundStarter);
        }
    };

    useEffect(() => {
        if (initialState) {
            setGameState(initialState);
        }
    }, [initialState]);
    
    return { gameState, handlePlayerAction, startNewRound, isProcessing, handlePlayerRejoin, handleStartNextRoundWithoutPlayer };
}; 