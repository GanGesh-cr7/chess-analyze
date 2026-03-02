import { Chessboard } from 'react-chessboard'
import type { CSSProperties } from 'react'
import { useGameStore } from '../store/gameStore'
import { useChessMoves } from '../hooks/useChessMoves'

export default function ChessBoard() {
    const { fen, myColor, lastMove } = useGameStore()
    const { onDrop, isPieceMovable } = useChessMoves()

    const boardOrientation = myColor === 'b' ? 'black' : 'white'

    const squareStyles: Record<string, CSSProperties> = {}
    if (lastMove) {
        squareStyles[lastMove.from] = { backgroundColor: 'rgba(255, 215, 0, 0.25)' }
        squareStyles[lastMove.to] = { backgroundColor: 'rgba(255, 215, 0, 0.35)' }
    }

    return (
        <div className="board-container rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <Chessboard
                options={{
                    position: fen,
                    onPieceDrop: onDrop,
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
