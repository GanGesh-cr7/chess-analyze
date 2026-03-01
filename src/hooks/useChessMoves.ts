import { useGameStore } from '../store/gameStore'
import { peerNetwork } from '../network/peer'
import { _checkGameEnd } from '../network/peer'

export function useChessMoves() {
    const { myColor, chess, phase, result } = useGameStore()

    const onDrop = (sourceSquare: string, targetSquare: string, piece: string): boolean => {
        if (phase !== 'playing' || result) return false

        const turn = chess.turn()
        if (myColor !== turn) return false

        const promotion = piece?.toLowerCase().endsWith('p') ? undefined : piece?.[1]?.toLowerCase()

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

    const isPieceMovable = ({ piece }: { piece: string }): boolean => {
        if (phase !== 'playing' || result) return false
        const pieceColor = piece[0] as 'w' | 'b'
        return pieceColor === myColor && myColor === chess.turn()
    }

    return { onDrop, isPieceMovable }
}
