import { useState } from 'react'
import type { GameConfig, TeamIdx } from '../game/engine'
import { Btn, Card, cn } from '../ui'

function TeamEditor({
  team,
  name,
  players,
  onName,
  onPlayers,
}: {
  team: TeamIdx
  name: string
  players: string[]
  onName: (v: string) => void
  onPlayers: (v: string[]) => void
}) {
  return (
    <Card className={team === 0 ? 'bg-mint/40' : 'bg-teamb/30'}>
      <input
        value={name}
        onChange={(e) => onName(e.target.value)}
        maxLength={16}
        placeholder={team === 0 ? 'Team 1 name' : 'Team 2 name'}
        className="w-full rounded-base border-2 border-ink bg-white px-3 py-2 text-lg font-black uppercase placeholder:text-ink/35 focus:outline-none"
      />
      <div className="mt-3 space-y-2">
        {players.map((p, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={p}
              onChange={(e) => {
                const next = [...players]
                next[i] = e.target.value
                onPlayers(next)
              }}
              maxLength={16}
              placeholder={`Player ${i + 1}`}
              className="min-w-0 flex-1 rounded-base border-2 border-ink bg-white px-3 py-2 font-bold placeholder:text-ink/35 focus:outline-none"
            />
            {players.length > 2 && (
              <button
                type="button"
                aria-label="Remove player"
                className="btn-brutal w-10 cursor-pointer rounded-base border-2 border-ink bg-hot-pink font-black shadow-brutal-sm"
                onClick={() => onPlayers(players.filter((_, j) => j !== i))}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      {players.length < 6 && (
        <button
          type="button"
          className="mt-3 cursor-pointer text-sm font-black tracking-wide uppercase underline underline-offset-2"
          onClick={() => onPlayers([...players, ''])}
        >
          + Add player
        </button>
      )}
    </Card>
  )
}

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
  const [teamNames, setTeamNames] = useState<[string, string]>(['Green Team', 'Pink Team'])
  const [players, setPlayers] = useState<[string[], string[]]>([
    ['', ''],
    ['', ''],
  ])
  const [deckSize, setDeckSize] = useState(40)
  const [turnSeconds, setTurnSeconds] = useState(60)
  const [customText, setCustomText] = useState('')
  const [error, setError] = useState<string | null>(null)

  function start() {
    const cleaned: [string[], string[]] = [
      players[0].map((p) => p.trim()).filter(Boolean),
      players[1].map((p) => p.trim()).filter(Boolean),
    ]
    if (cleaned[0].length < 2 || cleaned[1].length < 2) {
      setError('Each team needs at least 2 players, with names filled in.')
      return
    }
    const customNames = [...new Set(
      customText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    )].slice(0, 30)
    onStart({
      teams: [
        { name: teamNames[0].trim() || 'Team 1', players: cleaned[0] },
        { name: teamNames[1].trim() || 'Team 2', players: cleaned[1] },
      ],
      deckSize,
      turnSeconds,
      customNames,
    })
  }

  return (
    <div className="space-y-5">
      <h2 className="text-center text-3xl font-black uppercase">Who's playing?</h2>

      <TeamEditor
        team={0}
        name={teamNames[0]}
        players={players[0]}
        onName={(v) => setTeamNames([v, teamNames[1]])}
        onPlayers={(v) => setPlayers([v, players[1]])}
      />
      <TeamEditor
        team={1}
        name={teamNames[1]}
        players={players[1]}
        onName={(v) => setTeamNames([teamNames[0], v])}
        onPlayers={(v) => setPlayers([players[0], v])}
      />

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
        <p className="mt-4 text-xs font-black tracking-widest uppercase text-ink/60">
          Add your own names (optional, one per line)
        </p>
        <textarea
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          rows={3}
          placeholder={'Grandma Rosa\nThe family dog\n...'}
          className="mt-2 w-full rounded-base border-2 border-ink bg-white px-3 py-2 font-bold placeholder:text-ink/35 focus:outline-none"
        />
      </Card>

      {error && (
        <p className="rounded-base border-2 border-ink bg-hot-pink px-3 py-2 text-center text-sm font-black">
          {error}
        </p>
      )}

      <Btn variant="main" onClick={start}>
        Start Game
      </Btn>
      <Btn variant="neutral" onClick={onBack}>
        Back
      </Btn>
    </div>
  )
}
