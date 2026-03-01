import React from 'react'
import { Chessboard } from 'react-chessboard'
import { useGameStore } from '../store/gameStore'
import { useChessMoves } from '../hooks/useChessMoves'

export default function ChessBoard() {
    const { fen, myColor, lastMove, result } = useGameStore()
    const { onDrop, isPieceMovable } = useChessMoves()

    const boardOrientation = myColor === 'b' ? 'black' : 'white'

    const customSquareStyles: Record<string, React.CSSProperties> = {}
    if (lastMove) {
        customSquareStyles[lastMove.from] = { backgroundColor: 'rgba(255, 215, 0, 0.25)' }
        customSquareStyles[lastMove.to] = { backgroundColor: 'rgba(255, 215, 0, 0.35)' }
    }

    return (
        <div className="board-container rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <Chessboard
                position={fen}
                onPieceDrop={onDrop}
                boardOrientation={boardOrientation}
                isDraggablePiece={isPieceMovable}
                customSquareStyles={customSquareStyles}
                customDarkSquareStyle={{ backgroundColor: '#769656' }}
                customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
                customBoardStyle={{
                    borderRadius: '0px',
                    boxShadow: 'none',
                }}
                animationDuration={180}
                areArrowsAllowed
                promotionToSquare={undefined}
            />
        </div>
    )
}
