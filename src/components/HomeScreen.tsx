import { useState } from 'react'
import { useGameStore, TIME_CONTROLS } from '../store/gameStore'
import type { TimeControl } from '../store/gameStore'
import { peerNetwork } from '../network/peer'

function generateRoomId(): string {
    return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export default function HomeScreen() {
    const { setRoomId, setMyColor, setMyName, setTimeControl, setConnectionStatus, timeControl } =
        useGameStore()

    const [view, setView] = useState<'home' | 'create' | 'join'>('home')
    const [myName, setMyNameLocal] = useState('Player')
    const [generatedId, setGeneratedId] = useState('')
    const [joinId, setJoinId] = useState(() => {
        const dl = sessionStorage.getItem('deeplink_join')
        if (dl) { sessionStorage.removeItem('deeplink_join'); return dl }
        return ''
    })
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedTc, setSelectedTc] = useState<TimeControl>(timeControl)

    const handleCreate = async () => {
        if (!myName.trim()) {
            setError('Please enter your name')
            return
        }
        setLoading(true)
        setError('')
        const id = generateRoomId()
        setGeneratedId(id)
        setRoomId(id)
        setMyColor('w')
        setMyName(myName.trim())
        setTimeControl(selectedTc)
        try {
            await peerNetwork.createGame(id, myName.trim())
            setView('create')
        } catch (e: any) {
            setError('Failed to create game: ' + e.message)
        } finally {
            setLoading(false)
        }
    }

    const handleJoin = async () => {
        const id = joinId.trim().toUpperCase()
        if (!id) {
            setError('Please enter a Room ID')
            return
        }
        if (!myName.trim()) {
            setError('Please enter your name')
            return
        }
        setLoading(true)
        setError('')
        setRoomId(id)
        setMyColor('b')
        setMyName(myName.trim())
        setTimeControl(selectedTc)
        try {
            await peerNetwork.joinGame(id, myName.trim())
        } catch (e: any) {
            setError('Failed to join game: ' + e.message)
        } finally {
            setLoading(false)
        }
    }

    const copyLink = () => {
        const url = `${window.location.origin}${window.location.pathname}?join=${generatedId}`
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2500)
        })
    }

    const copyId = () => {
        navigator.clipboard.writeText(generatedId).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2500)
        })
    }

    if (view === 'create') {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="glass-strong rounded-2xl p-8 w-full max-w-md mx-4 animate-slide-up border border-white/10">
                    <div className="text-center mb-6">
                        <div className="text-4xl mb-3">♔</div>
                        <h2 className="text-2xl font-bold font-['Outfit']">Game Created!</h2>
                        <p className="text-white/50 text-sm mt-1">Share your room ID with a friend</p>
                    </div>

                    {/* Room ID big display */}
                    <div className="bg-black/30 rounded-xl p-5 text-center mb-4 border border-white/10">
                        <p className="text-xs text-white/40 mb-1 uppercase tracking-widest">Room ID</p>
                        <p className="text-4xl font-bold font-mono tracking-widest text-emerald-400">{generatedId}</p>
                    </div>

                    {/* Copy buttons */}
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={copyId}
                            className="flex-1 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-medium border border-emerald-500/30 transition-all active:scale-95"
                        >
                            {copied ? '✓ Copied!' : '📋 Copy ID'}
                        </button>
                        <button
                            onClick={copyLink}
                            className="flex-1 py-2.5 rounded-xl glass hover:bg-white/10 text-white/60 text-sm font-medium border border-white/10 transition-all active:scale-95"
                        >
                            🔗 Copy Link
                        </button>
                    </div>

                    {/* Waiting indicator */}
                    <div className="flex items-center justify-center gap-3 text-white/50 text-sm">
                        <svg className="animate-spin h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                            />
                        </svg>
                        Waiting for opponent to join…
                    </div>

                    <button
                        onClick={() => { setView('home'); peerNetwork.disconnect(); setConnectionStatus('idle') }}
                        className="mt-4 w-full py-2 rounded-xl text-white/30 hover:text-white/50 text-sm transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md mx-4 animate-fade-in">
                {/* Hero */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-700/20 border border-emerald-500/20 mb-5">
                        <span className="text-5xl">♞</span>
                    </div>
                    <h1 className="text-4xl font-bold font-['Outfit'] mb-2">
                        Peer<span className="text-emerald-400">Chess</span>
                    </h1>
                    <p className="text-white/40 text-sm">Play chess with friends — no account needed</p>
                </div>

                <div className="glass-strong rounded-2xl p-6 border border-white/10 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-widest font-medium">
                            Your Name
                        </label>
                        <input
                            type="text"
                            value={myName}
                            onChange={(e) => setMyNameLocal(e.target.value)}
                            placeholder="Enter your name…"
                            maxLength={20}
                            className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/25 text-sm outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                        />
                    </div>

                    {/* Time control */}
                    <div>
                        <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-widest font-medium">
                            Time Control
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {TIME_CONTROLS.map((tc) => (
                                <button
                                    key={tc.label}
                                    onClick={() => setSelectedTc(tc)}
                                    className={`py-2 rounded-xl text-sm font-medium border transition-all ${selectedTc.label === tc.label
                                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                        : 'bg-black/20 border-white/8 text-white/50 hover:text-white/70 hover:bg-white/5'
                                        }`}
                                >
                                    {tc.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2">
                            {error}
                        </div>
                    )}

                    {/* Buttons */}
                    {view === 'home' && (
                        <div className="space-y-3 pt-1">
                            <button
                                onClick={handleCreate}
                                disabled={loading}
                                className="w-full py-3.5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-emerald-900/30"
                            >
                                {loading ? 'Creating…' : '♔ Create Game'}
                            </button>
                            <button
                                onClick={() => setView('join')}
                                className="w-full py-3.5 sm:py-3 rounded-xl glass hover:bg-white/10 text-white/70 hover:text-white font-semibold text-sm border border-white/10 transition-all active:scale-[0.98]"
                            >
                                ♟ Join Game
                            </button>
                        </div>
                    )}

                    {view === 'join' && (
                        <div className="space-y-3 pt-1">
                            <div>
                                <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-widest font-medium">
                                    Room ID
                                </label>
                                <input
                                    type="text"
                                    value={joinId}
                                    onChange={(e) => setJoinId(e.target.value.toUpperCase())}
                                    placeholder="Enter 6-character code…"
                                    maxLength={6}
                                    className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/25 text-sm outline-none focus:border-emerald-500/50 font-mono tracking-widest uppercase transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                                />
                            </div>
                            <button
                                onClick={handleJoin}
                                disabled={loading}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-emerald-900/30"
                            >
                                {loading ? 'Connecting…' : 'Join Game →'}
                            </button>
                            <button
                                onClick={() => { setView('home'); setError('') }}
                                className="w-full py-2 rounded-xl text-white/30 hover:text-white/50 text-sm transition-colors"
                            >
                                ← Back
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-center text-white/20 text-xs mt-6">
                    Powered by WebRTC · No server · No account
                </p>
            </div>
        </div>
    )
}
