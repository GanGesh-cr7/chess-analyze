import { useGameStore } from '../store/gameStore'
import { peerNetwork } from '../network/peer'
import { _checkGameEnd } from '../network/peer'

export function useChessMoves() {
    const { myColor, chess, phase, result, setSelectedSquare } = useGameStore()

    const onDrop = ({ piece, sourceSquare, targetSquare }: { piece: { pieceType: string }; sourceSquare: string; targetSquare: string | null }): boolean => {
        if (phase !== 'playing' || result || !targetSquare) return false

        const turn = chess.turn()
        if (myColor !== turn) return false

        const pieceTypeChar = piece.pieceType[1].toLowerCase()
        const promotion = piece.pieceType.toLowerCase().endsWith('p') ? undefined : pieceTypeChar

        const store = useGameStore.getState()
        const move = store.applyMove(sourceSquare, targetSquare, promotion ?? 'q')
        if (!move) return false

        peerNetwork.send({
            type: 'move',
            from: sourceSquare,
            to: targetSquare,
            promotion: promotion ?? 'q',
        })

        _checkGameEnd()
        return true
    }

    const onSquareClick = (square: string) => {
        if (phase !== 'playing' || result) return
        const { myColor, chess, selectedSquare } = useGameStore.getState()

        // If clicking the same square, deselect
        if (selectedSquare === square) {
            setSelectedSquare(null)
            return
        }

        const piece = chess.get(square as any)
        if (piece && piece.color === myColor) {
            setSelectedSquare(square)
        } else {
            // Check if clicking a candidate move square to perform a move via click
            const { candidateMoves, applyMove } = useGameStore.getState()
            if (selectedSquare && candidateMoves.includes(square)) {
                const move = applyMove(selectedSquare, square)
                if (move) {
                    peerNetwork.send({
                        type: 'move',
                        from: selectedSquare,
                        to: square,
                        promotion: move.promotion || 'q',
                    })
                    _checkGameEnd()
                }
            } else {
                setSelectedSquare(null)
            }
        }
    }

    const isPieceMovable = ({ piece }: { piece: { pieceType: string } }): boolean => {
        if (phase !== 'playing' || result) return false
        const pieceColor = piece.pieceType[0] as 'w' | 'b'
        return pieceColor === myColor && myColor === chess.turn()
    }

    return { onDrop, onSquareClick, isPieceMovable }
}
