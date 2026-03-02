/**
 * Utility to communicate with Stockfish engine via Web Worker.
 */

class ChessEngine {
    private worker: Worker | null = null
    private onMessageCallback: ((msg: string) => void) | null = null

    constructor() {
        this.init()
    }

    private init() {
        if (typeof Worker === 'undefined') return

        // Using a public CDN for Stockfish.js (WASM version)
        this.worker = new Worker('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js')

        this.worker.onmessage = (e) => {
            if (this.onMessageCallback) {
                this.onMessageCallback(e.data)
            }
        }

        this.send('uci')
    }

    send(command: string) {
        if (this.worker) {
            this.worker.postMessage(command)
        }
    }

    analyze(fen: string, depth: number = 12): Promise<{ bestMove: string; evaluation: string }> {
        return new Promise((resolve) => {
            this.send(`position fen ${fen}`)
            this.send(`go depth ${depth}`)

            let bestMove = ''
            let evaluation = '0.0'

            const handleMessage = (msg: string) => {
                if (msg.startsWith('bestmove')) {
                    bestMove = msg.split(' ')[1]
                    this.onMessageCallback = null
                    resolve({ bestMove, evaluation })
                } else if (msg.includes('info depth') && msg.includes('score cp')) {
                    const parts = msg.split(' ')
                    const scoreIndex = parts.indexOf('cp')
                    if (scoreIndex !== -1) {
                        const score = parseInt(parts[scoreIndex + 1]) / 100
                        evaluation = score.toFixed(1)
                    }
                } else if (msg.includes('info depth') && msg.includes('score mate')) {
                    const parts = msg.split(' ')
                    const mateIndex = parts.indexOf('mate')
                    if (mateIndex !== -1) {
                        evaluation = `M${parts[mateIndex + 1]}`
                    }
                }
            }

            this.onMessageCallback = handleMessage
        })
    }

    stop() {
        this.send('stop')
    }
}

export const engine = new ChessEngine()
