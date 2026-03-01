import React, { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import Navbar from './components/Navbar'
import HomeScreen from './components/HomeScreen'
import GameView from './components/GameView'

// Handle ?join=ROOMID deep links
function useDeepLink() {
  const { setPhase } = useGameStore()
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const joinId = params.get('join')
    if (joinId) {
      // Pre-fill will be handled in HomeScreen
      // Store in sessionstorage for HomeScreen to pick up
      sessionStorage.setItem('deeplink_join', joinId.toUpperCase())
    }
  }, [])
}

export default function App() {
  useDeepLink()
  const { phase } = useGameStore()

  const isPlaying = phase === 'playing' || phase === 'ended'
  const isWaiting = phase === 'waiting'

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0f0f13]">
      <Navbar />
      <main className="flex-1 flex flex-col min-h-0 overflow-auto">
        {isPlaying ? (
          <GameView />
        ) : isWaiting ? (
          <HomeScreen />
        ) : (
          <HomeScreen />
        )}
      </main>
    </div>
  )
}
