import { useGameStore } from '../store/gameStore'
import { peerNetwork } from '../network/peer'
import { _checkGameEnd } from '../network/peer'

export function useChessMoves() {
    const { myColor, chess, phase, result } = useGameStore()

    const onDrop = ({ piece, sourceSquare, targetSquare }: { piece: { pieceType: string }; sourceSquare: string; targetSquare: string | null }): boolean => {
        if (phase !== 'playing' || result || !targetSquare) return false

        const turn = chess.turn()
        if (myColor !== turn) return false

        // piece.pieceType is 'wP', 'bN', etc.
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

    const isPieceMovable = ({ piece }: { piece: { pieceType: string } }): boolean => {
        if (phase !== 'playing' || result) return false
        const pieceColor = piece.pieceType[0] as 'w' | 'b'
        return pieceColor === myColor && myColor === chess.turn()
    }

    return { onDrop, isPieceMovable }
}
