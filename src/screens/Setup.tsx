import { useState } from 'react'
import type { GameConfig } from '../game/engine'
import { Btn, Card, cn } from '../ui'

function Segmented<T extends number>({
  options,
  value,
  onChange,
  render,
}: {
  options: T[]
  value: T
  onChange: (v: T) => void
  render: (v: T) => string
}) {
  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            'btn-brutal flex-1 cursor-pointer rounded-base border-2 border-ink px-2 py-2 font-black shadow-brutal-sm',
            value === o ? 'bg-main' : 'bg-white',
          )}
        >
          {render(o)}
        </button>
      ))}
    </div>
  )
}

export function Setup({
  onStart,
  onBack,
}: {
  onStart: (config: GameConfig) => void
  onBack: () => void
}) {
  const [deckSize, setDeckSize] = useState(40)
  const [turnSeconds, setTurnSeconds] = useState(60)

  function start() {
    onStart({ deckSize, turnSeconds })
  }

  return (
    <div className="space-y-5">
      <h2 className="text-center text-3xl font-black uppercase">New Game</h2>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-base border-2 border-ink bg-teama px-3 py-4 shadow-brutal">
          <p className="text-2xl font-black uppercase">Blue</p>
          <p className="text-xs font-bold text-ink/60">Team One</p>
        </div>
        <div className="rounded-base border-2 border-ink bg-teamb px-3 py-4 shadow-brutal">
          <p className="text-2xl font-black uppercase">Gold</p>
          <p className="text-xs font-bold text-ink/60">Team Two</p>
        </div>
      </div>
      <p className="text-center text-sm font-semibold text-ink/70">
        Split into two teams — that's all the setup there is. The phone just
        keeps the cards, the clock, and the score.
      </p>

      <Card>
        <p className="text-xs font-black tracking-widest uppercase text-ink/60">
          Cards in the deck
        </p>
        <div className="mt-2">
          <Segmented
            options={[30, 40, 50]}
            value={deckSize}
            onChange={setDeckSize}
            render={(v) => `${v}`}
          />
        </div>
        <p className="mt-4 text-xs font-black tracking-widest uppercase text-ink/60">
          Seconds per turn
        </p>
        <div className="mt-2">
          <Segmented
            options={[45, 60, 90]}
            value={turnSeconds}
            onChange={setTurnSeconds}
            render={(v) => `${v}s`}
          />
        </div>
      </Card>

      <Btn variant="main" onClick={start}>
        Start Game
      </Btn>
      <Btn variant="neutral" onClick={onBack}>
        Back
      </Btn>
    </div>
  )
}
