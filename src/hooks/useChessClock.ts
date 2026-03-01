import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { peerNetwork, _checkGameEnd } from '../network/peer'

/**
 * Manages the chess clock. The host (white) ticks the clock and syncs to
 * the opponent every second.
 */
export function useChessClock() {
    const {
        phase,
        myColor,
        chess,
        whiteTime,
        blackTime,
        setWhiteTime,
        setBlackTime,
        setResult,
    } = useGameStore()

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
        if (phase !== 'playing') {
            if (intervalRef.current) clearInterval(intervalRef.current)
            return
        }

        // Only the host (white) ticks the clock to avoid double-tick
        if (myColor !== 'w') return

        intervalRef.current = setInterval(() => {
            const state = useGameStore.getState()
            if (state.phase !== 'playing') return

            const turn = state.chess.turn()
            if (turn === 'w') {
                const newTime = state.whiteTime - 100
                if (newTime <= 0) {
                    setWhiteTime(0)
                    state.setResult({ winner: 'b', reason: 'timeout' })
                    peerNetwork.sendTimerSync(0, state.blackTime)
                } else {
                    setWhiteTime(newTime)
                    if (newTime % 1000 < 100) {
                        peerNetwork.sendTimerSync(newTime, state.blackTime)
                    }
                }
            } else {
                const newTime = state.blackTime - 100
                if (newTime <= 0) {
                    setBlackTime(0)
                    state.setResult({ winner: 'w', reason: 'timeout' })
                    peerNetwork.sendTimerSync(state.whiteTime, 0)
                } else {
                    setBlackTime(newTime)
                    if (newTime % 1000 < 100) {
                        peerNetwork.sendTimerSync(state.whiteTime, newTime)
                    }
                }
            }
        }, 100)

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, myColor])
}
