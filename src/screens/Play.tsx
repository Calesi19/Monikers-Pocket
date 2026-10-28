import { useEffect, useRef, useState } from 'react'
import {
  ROUND_RULES,
  afterSummary,
  currentCard,
  endTurn,
  gotIt,
  nextRound,
  passCard,
  removeCard,
  startTurn,
  toPassScreen,
  totalScores,
  type GameState,
} from '../game/engine'
import { beep, buzz, keepAwake, primeAudio } from '../fx'
import { Btn, Card, ScoreBug, TeamChip, cn } from '../ui'

export type Act = (fn: (s: GameState) => GameState) => void

function Header({ state }: { state: GameState }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="rounded-base border-2 border-ink bg-white px-3 py-1 text-xs font-black tracking-widest uppercase shadow-brutal-sm">
          Round {state.round + 1} · {ROUND_RULES[state.round].title}
        </span>
        <span className="rounded-base border-2 border-ink bg-white px-3 py-1 text-xs font-black tracking-widest uppercase shadow-brutal-sm">
          {state.remaining.length} cards left
        </span>
      </div>
      <ScoreBug teams={state.teams} totals={totalScores(state)} />
    </div>
  )
}

export function RoundIntro({ state, act }: { state: GameState; act: Act }) {
  const rule = ROUND_RULES[state.round]
  return (
    <div className="space-y-5">
      <Header state={state} />
      <Card className="bg-lemon p-6 text-center">
        <p className="text-xs font-black tracking-widest uppercase text-ink/60">
          Round {state.round + 1} of 3
        </p>
        <p className="mt-1 text-4xl font-black uppercase">{rule.title}</p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed font-semibold text-ink/80">
          {rule.rule}
        </p>
        <p className="mt-3 text-xs font-bold text-ink/60">
          Same {state.deck.length} cards as always. {state.turnSeconds} seconds
          per turn.
        </p>
      </Card>
      <Btn variant="main" onClick={() => act(toPassScreen)}>
        Start Round {state.round + 1}
      </Btn>
    </div>
  )
}

export function PassScreen({ state, act }: { state: GameState; act: Act }) {
  const team = state.turnTeam
  return (
    <div className="space-y-5">
      <Header state={state} />
      <Card className={cn('p-6 text-center', team === 0 ? 'bg-mint/50' : 'bg-teamb/40')}>
        <p className="text-xs font-black tracking-widest uppercase text-ink/60">
          Pass the phone to
        </p>
        <p className="mt-1 text-4xl font-black uppercase">{state.giverName}</p>
        <div className="mt-3">
          <TeamChip team={team} name={state.teams[team].name} />
        </div>
        <p className="mx-auto mt-3 max-w-xs text-sm font-semibold text-ink/75">
          {state.giverName} gives the clues — {state.teams[team].name} guesses.
          Everyone else: eyes off the card!
        </p>
        <p className="mt-2 text-xs font-bold text-ink/60">
          Round {state.round + 1}: {ROUND_RULES[state.round].title}
        </p>
      </Card>
      <Btn
        variant={team === 0 ? 'teama' : 'teamb'}
        onClick={() => {
          primeAudio()
          act((s) => startTurn(s, Date.now()))
        }}
      >
        I'm {state.giverName} — Start
      </Btn>
    </div>
  )
}

export function TurnScreen({ state, act }: { state: GameState; act: Act }) {
  const [leftMs, setLeftMs] = useState(
    () => (state.turnEndsAt ?? Date.now()) - Date.now(),
  )
  const [armedRemove, setArmedRemove] = useState<string | null>(null)
  const firedRef = useRef(false)
  const card = currentCard(state)

  useEffect(() => {
    void keepAwake(true)
    return () => {
      void keepAwake(false)
    }
  }, [])

  useEffect(() => {
    const iv = setInterval(() => {
      const left = (state.turnEndsAt ?? 0) - Date.now()
      setLeftMs(left)
      if (left <= 0 && !firedRef.current) {
        firedRef.current = true
        beep()
        buzz([200, 80, 300])
        act(endTurn)
      }
    }, 100)
    return () => clearInterval(iv)
  }, [state.turnEndsAt, act])

  if (!card) return null
  const seconds = Math.max(0, Math.ceil(leftMs / 1000))
  const fraction = Math.max(0, leftMs / (state.turnSeconds * 1000))
  const low = seconds <= 10

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-end justify-between">
          <span
            className={cn(
              'text-5xl font-black tabular-nums',
              low && 'animate-pulse text-red-600',
            )}
          >
            {seconds}
          </span>
          <span className="pb-1 text-xs font-black tracking-widest uppercase text-ink/60">
            {state.remaining.length} left · {state.turnGuessed.length} this turn
          </span>
        </div>
        <div className="mt-1 h-3 overflow-hidden rounded-base border-2 border-ink bg-white">
          <div
            className={cn('h-full', low ? 'bg-hot-pink' : 'bg-main')}
            style={{ width: `${fraction * 100}%` }}
          />
        </div>
      </div>

      <Card key={card.name} className="animate-pop p-6 text-center">
        <span className="inline-block rounded-base border-2 border-ink bg-lemon px-2.5 py-0.5 text-[11px] font-black tracking-widest uppercase shadow-brutal-sm">
          {card.tag}
        </span>
        <p className="mt-3 text-4xl leading-tight font-black uppercase">
          {card.name}
        </p>
        <p className="mx-auto mt-2 max-w-xs text-sm font-semibold text-ink/70">
          {card.blurb}
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Btn variant="lemon" onClick={() => act(passCard)}>
          Pass
        </Btn>
        <Btn variant="mint" onClick={() => act(gotIt)}>
          Got It ✓
        </Btn>
      </div>

      <button
        type="button"
        className={cn(
          'mx-auto block cursor-pointer text-xs font-bold underline underline-offset-2',
          armedRemove === card.name ? 'font-black text-red-600' : 'text-ink/50',
        )}
        onClick={() => {
          if (armedRemove === card.name) {
            setArmedRemove(null)
            act(removeCard)
          } else {
            setArmedRemove(card.name)
          }
        }}
      >
        {armedRemove === card.name
          ? 'Tap again — nobody knows this one, remove it'
          : 'Remove this card from the game'}
      </button>
    </div>
  )
}

export function TurnSummary({ state, act }: { state: GameState; act: Act }) {
  const team = state.turnTeam
  const nextTeam = team === 0 ? 1 : 0
  const nextGiver =
    state.teams[nextTeam].players[
      state.cursors[nextTeam] % state.teams[nextTeam].players.length
    ]
  return (
    <div className="space-y-5">
      <Header state={state} />
      <Card className={cn('p-6 text-center', team === 0 ? 'bg-mint/50' : 'bg-teamb/40')}>
        <div>
          <TeamChip team={team} name={state.teams[team].name} />
        </div>
        <p className="mt-2 text-3xl font-black uppercase">
          +{state.turnGuessed.length} this turn
        </p>
        {state.deckCleared ? (
          <p className="mt-1 text-sm font-black text-ink/70">
            That was the last card — round over!
          </p>
        ) : (
          <p className="mt-1 text-sm font-semibold text-ink/70">
            Time's up. The card in hand goes back in the pile.
          </p>
        )}
      </Card>

      {state.turnGuessed.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-1.5">
          {state.turnGuessed.map((n) => (
            <span
              key={n}
              className="rounded-base border border-ink bg-white px-2 py-0.5 text-[11px] font-bold"
            >
              {n}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm font-semibold text-ink/60">
          No cards that turn. The other team thanks you.
        </p>
      )}

      <Btn variant="main" onClick={() => act(afterSummary)}>
        {state.remaining.length === 0
          ? 'See Round Results'
          : `Pass to ${nextGiver} (${state.teams[nextTeam].name})`}
      </Btn>
    </div>
  )
}

export function RoundEnd({ state, act }: { state: GameState; act: Act }) {
  const totals = totalScores(state)
  return (
    <div className="space-y-5">
      <Card className="bg-lemon p-6 text-center">
        <p className="text-xs font-black tracking-widest uppercase text-ink/60">
          Round {state.round + 1} complete
        </p>
        <p className="mt-2 text-2xl font-black">
          {state.teams[0].name} {state.scores[state.round][0]} —{' '}
          {state.scores[state.round][1]} {state.teams[1].name}
        </p>
        <p className="mt-1 text-sm font-bold text-ink/70">
          Total: {totals[0]} — {totals[1]}
        </p>
      </Card>

      <Card>
        <div className="space-y-1.5 text-sm font-bold">
          {state.scores.slice(0, state.round + 1).map((r, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-ink/60">Round {i + 1}</span>
              <span>
                {r[0]} — {r[1]}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t-2 border-ink/15 pt-1.5 font-black">
            <span>Total</span>
            <span>
              {totals[0]} — {totals[1]}
            </span>
          </div>
        </div>
      </Card>

      <Btn variant="main" onClick={() => act(nextRound)}>
        {state.round >= 2 ? 'See Final Results' : `Start Round ${state.round + 2}`}
      </Btn>
    </div>
  )
}
