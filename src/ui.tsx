import { useState, type ReactNode } from 'react'
import { ROUND_RULES, type TeamIdx } from './game/engine'

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

export function Btn({
  children,
  onClick,
  variant = 'main',
  size = 'lg',
  disabled = false,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'main' | 'mint' | 'lemon' | 'pink' | 'neutral' | 'teama' | 'teamb'
  size?: 'lg' | 'sm'
  disabled?: boolean
  className?: string
}) {
  const colors: Record<string, string> = {
    main: 'bg-main text-ink',
    mint: 'bg-mint text-ink',
    lemon: 'bg-lemon text-ink',
    pink: 'bg-hot-pink text-ink',
    neutral: 'bg-white text-ink',
    teama: 'bg-teama text-ink',
    teamb: 'bg-teamb text-ink',
  }
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'btn-brutal cursor-pointer rounded-base border-2 border-ink font-black tracking-wide uppercase shadow-brutal disabled:cursor-not-allowed disabled:opacity-40',
        size === 'lg' ? 'w-full px-5 py-3.5 text-lg' : 'px-3 py-1.5 text-xs',
        colors[variant],
        className,
      )}
    >
      {children}
    </button>
  )
}

export function Card({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-base border-2 border-ink bg-white p-5 shadow-brutal',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function TeamChip({ team, name }: { team: TeamIdx; name: string }) {
  return (
    <span
      className={cn(
        'inline-block rounded-base border-2 border-ink px-2.5 py-0.5 text-xs font-black tracking-wider uppercase shadow-brutal-sm',
        team === 0 ? 'bg-teama' : 'bg-teamb',
      )}
    >
      {name}
    </span>
  )
}

export function ScoreBug({
  teams,
  totals,
}: {
  teams: [{ name: string }, { name: string }]
  totals: [number, number]
}) {
  return (
    <div className="flex items-center justify-center gap-2 text-sm font-black">
      <span className="rounded-base border-2 border-ink bg-teama px-2.5 py-1 shadow-brutal-sm">
        {teams[0].name} · {totals[0]}
      </span>
      <span className="text-ink/50">—</span>
      <span className="rounded-base border-2 border-ink bg-teamb px-2.5 py-1 shadow-brutal-sm">
        {totals[1]} · {teams[1].name}
      </span>
    </div>
  )
}

export function HowToPlay({ label = 'How to Play' }: { label?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Btn variant="neutral" onClick={() => setOpen(true)}>
        {label}
      </Btn>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="animate-pop max-h-[85vh] w-full max-w-md overflow-y-auto rounded-base border-2 border-ink bg-white p-6 shadow-brutal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-black uppercase">How to Play</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed font-semibold text-ink/85">
              <p>
                Two teams, one phone. On your turn you have one minute to get
                your team to guess as many names as you can. Tap{' '}
                <b>Got It</b> when they say the name; <b>Pass</b> sends the
                card to the back of the pile. Every guessed card is a point.
              </p>
              <p>
                The same deck is used for all three rounds — by round three,
                the inside jokes do the work:
              </p>
              {ROUND_RULES.map((r, i) => (
                <p key={r.title}>
                  <b>
                    Round {i + 1} — {r.title}:
                  </b>{' '}
                  {r.rule}
                </p>
              ))}
              <p>
                Stuck on a name nobody knows? The small <b>remove</b> button
                takes that card out of the game for good. Most points after
                round three wins.
              </p>
            </div>
            <div className="mt-5">
              <Btn variant="main" onClick={() => setOpen(false)}>
                Got It
              </Btn>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
