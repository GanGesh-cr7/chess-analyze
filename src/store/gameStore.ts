import { create } from 'zustand'
import { Chess, Move } from 'chess.js'

export type GamePhase = 'home' | 'creating' | 'joining' | 'waiting' | 'playing' | 'ended'
export type TimeControl = { label: string; minutes: number; increment: number }
export type PlayerColor = 'w' | 'b'
export type GameResult = {
    winner: PlayerColor | 'draw' | null
    reason: 'checkmate' | 'stalemate' | 'repetition' | 'timeout' | 'resignation' | 'draw_agreed' | 'insufficient'
}

export const TIME_CONTROLS: TimeControl[] = [
    { label: 'Bullet 1+0', minutes: 1, increment: 0 },
    { label: 'Blitz 3+0', minutes: 3, increment: 0 },
    { label: 'Blitz 5+0', minutes: 5, increment: 0 },
    { label: 'Rapid 10+0', minutes: 10, increment: 0 },
]

export interface CapturedPieces {
    w: string[]
    b: string[]
}

export interface GameState {
    // Phase & connection
    phase: GamePhase
    roomId: string | null
    myColor: PlayerColor | null
    opponentName: string
    myName: string
    connectionStatus: 'idle' | 'connecting' | 'connected' | 'disconnected'

    // Chess
    chess: Chess
    fen: string
    moveHistory: Move[]
    capturedPieces: CapturedPieces
    lastMove: { from: string; to: string } | null

    // Timers (ms)
    timeControl: TimeControl
    whiteTime: number
    blackTime: number

    // Game result
    result: GameResult | null
    drawOfferPending: boolean
    drawOfferFrom: PlayerColor | null
    rematchOfferPending: boolean
    rematchOfferFrom: PlayerColor | null
    selectedSquare: string | null
    candidateMoves: string[]

    // Actions
    setPhase: (phase: GamePhase) => void
    setRoomId: (id: string) => void
    setMyColor: (color: PlayerColor) => void
    setMyName: (name: string) => void
    setOpponentName: (name: string) => void
    setConnectionStatus: (s: GameState['connectionStatus']) => void
    setTimeControl: (tc: TimeControl) => void
    applyMove: (from: string, to: string, promotion?: string) => Move | null
    applyOpponentMove: (from: string, to: string, promotion?: string) => Move | null
    setWhiteTime: (t: number) => void
    setBlackTime: (t: number) => void
    setResult: (r: GameResult) => void
    setDrawOfferPending: (pending: boolean, from?: PlayerColor) => void
    setRematchOfferPending: (pending: boolean, from?: PlayerColor) => void
    setSelectedSquare: (sq: string | null) => void
    resetGame: () => void
}

function computeCaptured(chess: Chess): CapturedPieces {
    const startCounts: Record<string, number> = {
        p: 8, n: 2, b: 2, r: 2, q: 1, k: 1,
    }
    const remaining: Record<string, Record<string, number>> = { w: {}, b: {} }
    for (const row of chess.board()) {
        for (const sq of row) {
            if (!sq) continue
            const color = sq.color as 'w' | 'b'
            const type = sq.type
            remaining[color][type] = (remaining[color][type] || 0) + 1
        }
    }
    const captured: CapturedPieces = { w: [], b: [] }
    const pieceOrder = ['q', 'r', 'b', 'n', 'p']
    for (const pt of pieceOrder) {
        const whiteRemaining = remaining['w'][pt] || 0
        const blackRemaining = remaining['b'][pt] || 0
        const whiteCaptured = startCounts[pt] - whiteRemaining
        const blackCaptured = startCounts[pt] - blackRemaining
        for (let i = 0; i < blackCaptured; i++) captured.b.push('w' + pt) // black captured white pieces
        for (let i = 0; i < whiteCaptured; i++) captured.w.push('b' + pt) // white captured black pieces
    }
    return captured
}

const initialChess = new Chess()

const DEFAULT_TIME_CONTROL = TIME_CONTROLS[2] // 5+0

export const useGameStore = create<GameState>((set, get) => ({
    phase: 'home',
    roomId: null,
    myColor: null,
    opponentName: 'Opponent',
    myName: 'You',
    connectionStatus: 'idle',

    chess: initialChess,
    fen: initialChess.fen(),
    moveHistory: [],
    capturedPieces: { w: [], b: [] },
    lastMove: null,
    drawOfferPending: false,
    drawOfferFrom: null,
    rematchOfferPending: false,
    rematchOfferFrom: null,
    selectedSquare: null,
    candidateMoves: [],

    timeControl: DEFAULT_TIME_CONTROL,
    whiteTime: DEFAULT_TIME_CONTROL.minutes * 60 * 1000,
    blackTime: DEFAULT_TIME_CONTROL.minutes * 60 * 1000,

    result: null,

    setPhase: (phase) => set({ phase }),
    setRoomId: (roomId) => set({ roomId }),
    setMyColor: (myColor) => set({ myColor }),
    setMyName: (myName) => set({ myName }),
    setOpponentName: (opponentName) => set({ opponentName }),
    setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
    setTimeControl: (timeControl) =>
        set({
            timeControl,
            whiteTime: timeControl.minutes * 60 * 1000,
            blackTime: timeControl.minutes * 60 * 1000,
        }),
    setWhiteTime: (whiteTime) => set({ whiteTime }),
    setBlackTime: (blackTime) => set({ blackTime }),
    setResult: (result) => set({ result, phase: 'ended' }),
    setDrawOfferPending: (drawOfferPending, drawOfferFrom) =>
        set({ drawOfferPending, drawOfferFrom: drawOfferFrom ?? null }),
    setRematchOfferPending: (rematchOfferPending, rematchOfferFrom) =>
        set({ rematchOfferPending, rematchOfferFrom: rematchOfferFrom ?? null }),
    setSelectedSquare: (selectedSquare) => {
        if (!selectedSquare) {
            set({ selectedSquare: null, candidateMoves: [] })
            return
        }
        const { chess } = get()
        const moves = chess.moves({ square: selectedSquare as any, verbose: true })
        set({ selectedSquare, candidateMoves: moves.map(m => m.to) })
    },

    applyMove: (from, to, promotion = 'q') => {
        const { chess, moveHistory, timeControl, whiteTime, blackTime } = get()
        // Clear selection on move
        set({ selectedSquare: null, candidateMoves: [] })
        try {
            const move = chess.move({ from, to, promotion })
            if (!move) return null
            const newHistory = [...moveHistory, move]
            const captured = computeCaptured(chess)
            // Add increment
            const turn = move.color // color that just moved
            const wTime = turn === 'w' ? whiteTime + timeControl.increment * 1000 : whiteTime
            const bTime = turn === 'b' ? blackTime + timeControl.increment * 1000 : blackTime
            set({
                fen: chess.fen(),
                moveHistory: newHistory,
                capturedPieces: captured,
                lastMove: { from, to },
                whiteTime: wTime,
                blackTime: bTime,
            })
            return move
        } catch {
            return null
        }
    },

    applyOpponentMove: (from, to, promotion = 'q') => {
        return get().applyMove(from, to, promotion)
    },

    resetGame: () => {
        const chess = new Chess()
        const tc = get().timeControl
        set({
            chess,
            fen: chess.fen(),
            moveHistory: [],
            capturedPieces: { w: [], b: [] },
            lastMove: null,
            result: null,
            drawOfferPending: false,
            drawOfferFrom: null,
            whiteTime: tc.minutes * 60 * 1000,
            blackTime: tc.minutes * 60 * 1000,
            phase: 'playing',
            selectedSquare: null,
            candidateMoves: [],
            rematchOfferPending: false,
            rematchOfferFrom: null,
        })
    },
}))
