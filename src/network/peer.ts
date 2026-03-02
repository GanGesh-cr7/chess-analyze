import Peer from 'peerjs'
import type { DataConnection } from 'peerjs'
import { useGameStore } from '../store/gameStore'
import type { PlayerColor } from '../store/gameStore'

export type PeerMessage =
    | { type: 'move'; from: string; to: string; promotion?: string }
    | { type: 'resign' }
    | { type: 'draw_offer' }
    | { type: 'draw_accept' }
    | { type: 'draw_decline' }
    | { type: 'timer_sync'; whiteTime: number; blackTime: number }
    | { type: 'hello'; name: string; color: PlayerColor }
    | { type: 'rematch_offer' }
    | { type: 'rematch_accept' }
    | { type: 'rematch_decline' }

class PeerNetwork {
    private peer: Peer | null = null
    private conn: DataConnection | null = null
    private myColor: PlayerColor = 'w'

    createGame(roomId: string, name: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.myColor = 'w'
            this.peer = new Peer(roomId)

            this.peer.on('open', () => {
                const store = useGameStore.getState()
                store.setConnectionStatus('connecting')
                store.setPhase('waiting')
                resolve()
            })

            this.peer.on('connection', (conn) => {
                this.conn = conn
                this._setupConnection(conn, name)
            })

            this.peer.on('error', (err) => {
                console.error('PeerJS error:', err)
                reject(err)
            })
        })
    }

    joinGame(roomId: string, name: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.myColor = 'b'
            this.peer = new Peer()

            this.peer.on('open', () => {
                const store = useGameStore.getState()
                store.setConnectionStatus('connecting')

                if (!this.peer) return reject(new Error('No peer'))
                const conn = this.peer.connect(roomId, { reliable: true })
                this.conn = conn
                this._setupConnection(conn, name)
                resolve()
            })

            this.peer.on('error', (err) => {
                console.error('PeerJS error:', err)
                reject(err)
            })
        })
    }

    private _setupConnection(conn: DataConnection, myName: string) {
        const store = useGameStore.getState()

        conn.on('open', () => {
            store.setConnectionStatus('connected')
            // Send hello
            this.send({ type: 'hello', name: myName, color: this.myColor })
            store.resetGame()
        })

        conn.on('data', (raw) => {
            const msg = raw as PeerMessage
            this._handleMessage(msg)
        })

        conn.on('close', () => {
            store.setConnectionStatus('disconnected')
            const { phase } = useGameStore.getState()
            if (phase === 'playing') {
                // Treat as opponent disconnect but don't auto-end — just show disconnected
                useGameStore.getState().setConnectionStatus('disconnected')
            }
        })

        conn.on('error', (err) => {
            console.error('Connection error:', err)
        })
    }

    private _handleMessage(msg: PeerMessage) {
        const store = useGameStore.getState()

        switch (msg.type) {
            case 'hello': {
                store.setOpponentName(msg.name)
                // Set my color (opposite of what they say they are)
                const opponentColor = msg.color as PlayerColor
                const myColor: PlayerColor = opponentColor === 'w' ? 'b' : 'w'
                store.setMyColor(myColor)
                store.setPhase('playing')
                break
            }
            case 'move': {
                store.applyOpponentMove(msg.from, msg.to, msg.promotion)
                // Check for game end
                _checkGameEnd()
                break
            }
            case 'resign': {
                // Opponent resigned — we win
                const winner: PlayerColor = store.myColor === 'w' ? 'w' : 'b'
                store.setResult({ winner, reason: 'resignation' })
                break
            }
            case 'draw_offer': {
                store.setDrawOfferPending(true, store.myColor === 'w' ? 'b' : 'w')
                break
            }
            case 'draw_accept': {
                store.setResult({ winner: 'draw', reason: 'draw_agreed' })
                break
            }
            case 'draw_decline': {
                store.setDrawOfferPending(false)
                break
            }
            case 'timer_sync': {
                store.setWhiteTime(msg.whiteTime)
                store.setBlackTime(msg.blackTime)
                break
            }
            case 'rematch_offer': {
                store.setRematchOfferPending(true, store.myColor === 'w' ? 'b' : 'w')
                break
            }
            case 'rematch_accept': {
                store.resetGame()
                store.setRematchOfferPending(false)
                break
            }
            case 'rematch_decline': {
                store.setRematchOfferPending(false)
                break
            }
        }
    }

    send(msg: PeerMessage) {
        if (this.conn && this.conn.open) {
            this.conn.send(msg)
        }
    }

    sendTimerSync(whiteTime: number, blackTime: number) {
        this.send({ type: 'timer_sync', whiteTime, blackTime })
    }

    disconnect() {
        this.conn?.close()
        this.peer?.destroy()
        this.conn = null
        this.peer = null
    }
}

function _checkGameEnd() {
    const { chess, myColor, setResult } = useGameStore.getState()
    if (!myColor) return
    if (chess.isCheckmate()) {
        const winner: PlayerColor = chess.turn() === 'w' ? 'b' : 'w'
        setResult({ winner, reason: 'checkmate' })
    } else if (chess.isStalemate()) {
        setResult({ winner: 'draw', reason: 'stalemate' })
    } else if (chess.isThreefoldRepetition()) {
        setResult({ winner: 'draw', reason: 'repetition' })
    } else if (chess.isInsufficientMaterial()) {
        setResult({ winner: 'draw', reason: 'insufficient' })
    }
}

export const peerNetwork = new PeerNetwork()
export { _checkGameEnd }
