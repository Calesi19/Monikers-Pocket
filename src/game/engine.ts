// Pure game logic for Monikers Pocket — no React, no DOM. The whole state
// is JSON-serializable so it can be saved to localStorage after every move
// and a game survives a refresh, a locked screen, or a dead tab.
import { NAMES, type NameCard } from './names'

export interface GameConfig {
  deckSize: number
  turnSeconds: number
  customNames: string[]
}

export type Phase =
  | 'roundIntro'
  | 'pass'
  | 'turn'
  | 'turnSummary'
  | 'roundEnd'
  | 'gameEnd'

export type TeamIdx = 0 | 1

export interface GameState {
  turnSeconds: number
  /** The game's full deck — the same cards are reused all three rounds. */
  deck: NameCard[]
  /** Cards removed mid-game ("nobody knows this one") — gone for good. */
  removed: string[]
  /** 0, 1, or 2. */
  round: number
  /** This round's pile. remaining[0] is the card in hand; passes rotate it to the back. */
  remaining: NameCard[]
  /** scores[round][team] */
  scores: [number, number][]
  phase: Phase
  /** Whose turn it is (or was, on summary screens). */
  turnTeam: TeamIdx
  /** Names guessed during the current/last turn, for the summary screen. */
  turnGuessed: string[]
  /** Epoch ms when the active turn runs out; null outside the turn phase. */
  turnEndsAt: number | null
  /** True when the last turn ended because the round's deck ran out. */
  deckCleared: boolean
}

export const ROUND_RULES: { title: string; rule: string }[] = [
  {
    title: 'Say Anything',
    rule: "Describe the name any way you like — words, sounds, gestures — just don't say the name itself.",
  },
  {
    title: 'One Word',
    rule: 'One single word per card. That is all. Your team has seen every card before — make it count.',
  },
  {
    title: 'Charades',
    rule: 'No words at all. No sounds. Act it out and hope your team remembers round one.',
  },
]

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function newGame(config: GameConfig): GameState {
  const custom: NameCard[] = config.customNames.map((name) => ({
    name,
    tag: 'Custom',
    blurb: 'Added by a player in this room.',
  }))
  const builtinCount = Math.max(0, config.deckSize - custom.length)
  const deck = shuffle([...custom, ...shuffle(NAMES).slice(0, builtinCount)])
  return {
    turnSeconds: config.turnSeconds,
    deck,
    removed: [],
    round: 0,
    remaining: shuffle(deck),
    scores: [
      [0, 0],
      [0, 0],
      [0, 0],
    ],
    phase: 'roundIntro',
    turnTeam: 0,
    turnGuessed: [],
    turnEndsAt: null,
    deckCleared: false,
  }
}

export function currentCard(state: GameState): NameCard | null {
  return state.remaining[0] ?? null
}

export function totalScores(state: GameState): [number, number] {
  return [
    state.scores.reduce((sum, r) => sum + r[0], 0),
    state.scores.reduce((sum, r) => sum + r[1], 0),
  ]
}

/** Move to the pass screen: hand the phone to the team that's up. */
export function toPassScreen(state: GameState): GameState {
  return { ...state, phase: 'pass', deckCleared: false }
}

/** Begin the timed turn. */
export function startTurn(state: GameState, now: number): GameState {
  return {
    ...state,
    turnGuessed: [],
    turnEndsAt: now + state.turnSeconds * 1000,
    phase: 'turn',
  }
}

/** The team guessed the card in hand: score it and draw the next one. */
export function gotIt(state: GameState): GameState {
  if (state.phase !== 'turn' || state.remaining.length === 0) return state
  const [card, ...rest] = state.remaining
  const scores = state.scores.map((r) => [...r]) as [number, number][]
  scores[state.round][state.turnTeam] += 1
  const next: GameState = {
    ...state,
    remaining: rest,
    scores,
    turnGuessed: [...state.turnGuessed, card.name],
  }
  if (rest.length === 0) {
    // The deck is done — the round ends right now, mid-turn.
    return { ...next, phase: 'turnSummary', turnEndsAt: null, deckCleared: true }
  }
  return next
}

/** Pass on the card in hand: it goes to the back of this round's pile. */
export function passCard(state: GameState): GameState {
  if (state.phase !== 'turn' || state.remaining.length <= 1) return state
  const [card, ...rest] = state.remaining
  return { ...state, remaining: [...rest, card] }
}

/** Remove the card in hand from the whole game (the table veto). */
export function removeCard(state: GameState): GameState {
  if (state.phase !== 'turn' || state.remaining.length === 0) return state
  const [card, ...rest] = state.remaining
  const next: GameState = {
    ...state,
    remaining: rest,
    deck: state.deck.filter((c) => c.name !== card.name),
    removed: [...state.removed, card.name],
  }
  if (rest.length === 0) {
    return { ...next, phase: 'turnSummary', turnEndsAt: null, deckCleared: true }
  }
  return next
}

/** Time's up (or the giver ends early): close out the turn. */
export function endTurn(state: GameState): GameState {
  if (state.phase !== 'turn') return state
  return { ...state, phase: 'turnSummary', turnEndsAt: null }
}

/** Leave the turn summary: next team's pass screen, or the round-end screen. */
export function afterSummary(state: GameState): GameState {
  if (state.remaining.length === 0) {
    return { ...state, phase: 'roundEnd' }
  }
  const turnTeam = (1 - state.turnTeam) as TeamIdx
  return toPassScreen({ ...state, turnTeam })
}

/** Leave the round-end screen: next round with the same deck, or the final. */
export function nextRound(state: GameState): GameState {
  if (state.round >= 2) {
    return { ...state, phase: 'gameEnd' }
  }
  // The team that didn't take the last turn leads the new round.
  const turnTeam = (1 - state.turnTeam) as TeamIdx
  return {
    ...state,
    round: state.round + 1,
    remaining: shuffle(state.deck),
    turnTeam,
    phase: 'roundIntro',
    turnGuessed: [],
    turnEndsAt: null,
    deckCleared: false,
  }
}
