import { totalScores, type GameState } from '../game/engine'
import { Btn, Card } from '../ui'

export function GameEnd({
  state,
  onPlayAgain,
  onSetup,
  onHome,
}: {
  state: GameState
  onPlayAgain: () => void
  onSetup: () => void
  onHome: () => void
}) {
  const totals = totalScores(state)
  const winner =
    totals[0] === totals[1] ? null : totals[0] > totals[1] ? 0 : 1
  return (
    <div className="space-y-5">
      <Card
        className={
          winner === null
            ? 'bg-lemon p-6 text-center'
            : winner === 0
              ? 'bg-mint p-6 text-center'
              : 'bg-teamb p-6 text-center'
        }
      >
        <p className="text-xs font-black tracking-widest uppercase text-ink/60">
          Final score
        </p>
        <p className="mt-2 text-6xl font-black">
          {totals[0]} — {totals[1]}
        </p>
        <p className="mt-2 text-2xl font-black uppercase">
          {winner === null
            ? "It's a tie!"
            : `${state.teams[winner].name} win!`}
        </p>
      </Card>

      <Card>
        <div className="space-y-1.5 text-sm font-bold">
          <div className="flex items-center justify-between text-ink/60">
            <span></span>
            <span>
              {state.teams[0].name} · {state.teams[1].name}
            </span>
          </div>
          {state.scores.map((r, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-ink/60">Round {i + 1}</span>
              <span>
                {r[0]} · {r[1]}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t-2 border-ink/15 pt-1.5 font-black">
            <span>Total</span>
            <span>
              {totals[0]} · {totals[1]}
            </span>
          </div>
        </div>
        {state.removed.length > 0 && (
          <p className="mt-3 text-xs font-semibold text-ink/55">
            Removed along the way: {state.removed.join(', ')}
          </p>
        )}
      </Card>

      <Btn variant="main" onClick={onPlayAgain}>
        Play Again — Same Teams
      </Btn>
      <Btn variant="neutral" onClick={onSetup}>
        New Teams
      </Btn>
      <Btn variant="neutral" onClick={onHome}>
        Home
      </Btn>
    </div>
  )
}
