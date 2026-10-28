import { useCallback, useEffect, useState } from 'react'
import {
  endTurn,
  newGame,
  totalScores,
  type GameConfig,
  type GameState,
} from './game/engine'
import { Setup } from './screens/Setup'
import {
  PassScreen,
  RoundEnd,
  RoundIntro,
  TurnScreen,
  TurnSummary,
} from './screens/Play'
import { GameEnd } from './screens/End'
import { Btn, HowToPlay } from './ui'

const SAVE_KEY = 'monikers-pocket-save-v2'

function loadSave(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as GameState
    if (s.phase === 'turn') {
      // Saved mid-turn: resume if time is left, otherwise close the turn out.
      return s.turnEndsAt && s.turnEndsAt > Date.now() ? s : endTurn(s)
    }
    return s
  } catch {
    return null
  }
}

type Screen = 'home' | 'setup' | 'game'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [game, setGame] = useState<GameState | null>(loadSave)
  const [armQuit, setArmQuit] = useState(false)

  useEffect(() => {
    try {
      if (game) localStorage.setItem(SAVE_KEY, JSON.stringify(game))
    } catch {
      // storage full/blocked — the game still plays, it just won't resume
    }
  }, [game])

  const act = useCallback((fn: (s: GameState) => GameState) => {
    setGame((g) => (g ? fn(g) : g))
  }, [])

  function startGame(config: GameConfig) {
    setGame(newGame(config))
    setScreen('game')
  }

  function quitToHome() {
    try {
      localStorage.removeItem(SAVE_KEY)
    } catch {
      // ignore
    }
    setGame(null)
    setArmQuit(false)
    setScreen('home')
  }

  function playAgain() {
    if (!game) return
    startGame({
      turnSeconds: game.turnSeconds,
      deckSize: game.deck.length + game.removed.length,
    })
  }

  const resumable = game !== null && game.phase !== 'gameEnd'

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-5">
      {screen === 'game' && game && (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={() => (armQuit ? quitToHome() : setArmQuit(true))}
            onBlur={() => setArmQuit(false)}
            className={
              armQuit
                ? 'cursor-pointer rounded-base border-2 border-ink bg-hot-pink px-2.5 py-1 text-xs font-black uppercase shadow-brutal-sm'
                : 'cursor-pointer text-xs font-bold text-ink/45 underline underline-offset-2'
            }
          >
            {armQuit ? 'Tap again to end this game' : 'End game'}
          </button>
        </div>
      )}

      <main className="flex-1">
        {screen === 'home' && (
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <img
                src={`${import.meta.env.BASE_URL}icon-192.png`}
                alt=""
                className="mx-auto h-24 w-24 rounded-[22%] border-2 border-ink shadow-brutal"
              />
              <h1 className="mt-4 text-5xl font-black tracking-tight uppercase">
                Monikers
              </h1>
              <p className="mt-1 text-lg font-black tracking-widest text-main-deep uppercase">
                Pocket Edition
              </p>
              <p className="mx-auto mt-3 max-w-xs text-sm font-semibold text-ink/70">
                One phone, two teams, three rounds. Describe it, say one word,
                act it out.
              </p>
            </div>

            <div className="space-y-3">
              <Btn variant="main" onClick={() => setScreen('setup')}>
                New Game
              </Btn>
              {resumable && game && (
                <Btn variant="mint" onClick={() => setScreen('game')}>
                  Resume — Round {game.round + 1},{' '}
                  {totalScores(game)[0]}–{totalScores(game)[1]}
                </Btn>
              )}
              <HowToPlay />
            </div>

          </div>
        )}

        {screen === 'setup' && (
          <Setup onStart={startGame} onBack={() => setScreen('home')} />
        )}

        {screen === 'game' && game && (
          <>
            {game.phase === 'roundIntro' && (
              <RoundIntro state={game} act={act} />
            )}
            {game.phase === 'pass' && <PassScreen state={game} act={act} />}
            {game.phase === 'turn' && <TurnScreen state={game} act={act} />}
            {game.phase === 'turnSummary' && (
              <TurnSummary state={game} act={act} />
            )}
            {game.phase === 'roundEnd' && <RoundEnd state={game} act={act} />}
            {game.phase === 'gameEnd' && (
              <GameEnd
                state={game}
                onPlayAgain={playAgain}
                onSetup={() => setScreen('setup')}
                onHome={quitToHome}
              />
            )}
          </>
        )}
      </main>

      <footer className="pt-6 text-center text-[11px] font-semibold text-ink/40">
        Monikers Pocket — a pass-and-play party game
      </footer>
    </div>
  )
}
