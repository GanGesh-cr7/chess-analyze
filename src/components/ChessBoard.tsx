import { Chessboard } from 'react-chessboard'
import type { CSSProperties } from 'react'
import { useGameStore } from '../store/gameStore'
import { useChessMoves } from '../hooks/useChessMoves'

export default function ChessBoard() {
    const { fen, myColor, lastMove, chess, selectedSquare, candidateMoves } = useGameStore()
    const { onDrop, onSquareClick, isPieceMovable } = useChessMoves()

    const boardOrientation = myColor === 'b' ? 'black' : 'white'

    const squareStyles: Record<string, CSSProperties> = {}

    // 1. Highlight last move
    if (lastMove) {
        squareStyles[lastMove.from] = { backgroundColor: 'rgba(255, 215, 0, 0.25)' }
        squareStyles[lastMove.to] = { backgroundColor: 'rgba(255, 215, 0, 0.35)' }
    }

    // 2. Highlight selected square
    if (selectedSquare) {
        squareStyles[selectedSquare] = { backgroundColor: 'rgba(74, 222, 128, 0.4)' }
    }

    // 3. Highlight candidate moves
    candidateMoves.forEach(sq => {
        squareStyles[sq] = {
            background: 'radial-gradient(circle, rgba(0,0,0,.1) 20%, transparent 25%)',
            borderRadius: '50%'
        }
    })

    // 4. Highlight king in check
    if (chess.inCheck()) {
        const turn = chess.turn()
        // Find king square
        let kingSq: string | null = null
        for (const row of chess.board()) {
            for (const sq of row) {
                if (sq && sq.type === 'k' && sq.color === turn) {
                    kingSq = sq.square
                    break
                }
            }
        }
        if (kingSq) {
            squareStyles[kingSq] = {
                background: 'radial-gradient(circle, rgba(255,0,0,.4) 0%, rgba(255,0,0,.5) 100%)',
            }
        }
    }

    return (
        <div className="board-container rounded-sm sm:rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <Chessboard
                options={{
                    position: fen,
                    onPieceDrop: onDrop,
                    onSquareClick: ({ square }) => onSquareClick(square),
                    boardOrientation: boardOrientation,
                    canDragPiece: isPieceMovable,
                    squareStyles: squareStyles,
                    darkSquareStyle: { backgroundColor: '#769656' },
                    lightSquareStyle: { backgroundColor: '#eeeed2' },
                    boardStyle: {
                        borderRadius: '0px',
                        boxShadow: 'none',
                    },
                    animationDurationInMs: 180,
                    allowDrawingArrows: true,
                }}
            />
        </div>
    )
}
