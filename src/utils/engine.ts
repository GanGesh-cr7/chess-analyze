/**
 * Utility to communicate with Stockfish engine via Web Worker.
 */

export type MoveClassification = 'Brilliant' | 'Great' | 'Best' | 'Excellent' | 'Good' | 'Book' | 'Inaccuracy' | 'Mistake' | 'Blunder' | 'Normal'

class ChessEngine {
    private worker: Worker | null = null
    private onMessageCallback: ((msg: string) => void) | null = null

    constructor() {
        this.init()
    }

    private init() {
        if (typeof Worker === 'undefined') return

        try {
            // Updated to the most modern stable version available on common CDNs (SF 16.1)
            // SF 17 requires multiple .wasm/worker files which are harder to host via Blob Worker
            const stockfishUrl = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/16.1.0/stockfish-nnue-16.js'
            const blobCode = `importScripts('${stockfishUrl}');`
            const blob = new Blob([blobCode], { type: 'application/javascript' })
            const workerUrl = URL.createObjectURL(blob)

            this.worker = new Worker(workerUrl)

            this.worker.onmessage = (e) => {
                if (this.onMessageCallback) {
                    this.onMessageCallback(e.data)
                }
            }

            this.send('uci')
            this.send('setoption name Use NNUE value true')
        } catch (err) {
            console.error('Failed to initialize Stockfish worker:', err)
        }
    }

    send(command: string) {
        if (this.worker) {
            this.worker.postMessage(command)
        }
    }

    // Helper to categorize move quality
    classifyMove(prevEval: number, currentEval: number, isWhite: boolean): MoveClassification {
        const diff = isWhite ? (prevEval - currentEval) : (currentEval - prevEval)
        // Loss of centipawns (positive is bad)
        if (diff > 2.0) return 'Blunder'
        if (diff > 1.0) return 'Mistake'
        if (diff > 0.5) return 'Inaccuracy'
        if (diff > 0.1) return 'Good'
        if (diff > -0.1) return 'Best' // Very close to engine's evaluation
        if (diff > -0.5) return 'Excellent'
        return 'Great'
    }

    analyze(fen: string, depth: number = 14): Promise<{ bestMove: string; evaluation: number; scoreText: string }> {
        return new Promise((resolve) => {
            if (!this.worker) {
                return resolve({ bestMove: '', evaluation: 0, scoreText: '0.0' })
            }

            this.send(`position fen ${fen}`)
            this.send(`go depth ${depth}`)

            let bestMove = ''
            let evaluationValue = 0
            let scoreText = '0.0'

            const handleMessage = (msg: string) => {
                if (msg.startsWith('bestmove')) {
                    bestMove = msg.split(' ')[1]
                    this.onMessageCallback = null
                    resolve({ bestMove, evaluation: evaluationValue, scoreText })
                } else if (msg.includes('info depth') && msg.includes('score cp')) {
                    const parts = msg.split(' ')
                    const scoreIndex = parts.indexOf('cp')
                    if (scoreIndex !== -1) {
                        const score = parseInt(parts[scoreIndex + 1]) / 100
                        evaluationValue = score
                        scoreText = score.toFixed(1)
                    }
                } else if (msg.includes('info depth') && msg.includes('score mate')) {
                    const parts = msg.split(' ')
                    const mateIndex = parts.indexOf('mate')
                    if (mateIndex !== -1) {
                        const mateIn = parts[mateIndex + 1]
                        evaluationValue = parseInt(mateIn) > 0 ? 1000 : -1000 // Huge value for mates
                        scoreText = `M${mateIn}`
                    }
                }
            }

            this.onMessageCallback = handleMessage
        })
    }

    stop() {
        this.send('stop')
        this.onMessageCallback = null
    }
}

// Singleton instance
let engineInstance: ChessEngine | null = null
try {
    engineInstance = new ChessEngine()
} catch (e) {
    console.error('Error creating engine instance:', e)
}

export const engine = engineInstance!
