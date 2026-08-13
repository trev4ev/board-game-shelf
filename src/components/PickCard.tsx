import { Button } from './Button'
import diceUrl from '../assets/dice-sparkle.svg'
import './PickCard.css'

type PickCardProps = {
  disabled: boolean
  onPick: () => void
}

export function PickCard({ disabled, onPick }: PickCardProps) {
  return (
    <aside className="pick-card">
      <div className="pick-card-illust" aria-hidden style={{ maskImage: `url(${diceUrl})`, WebkitMaskImage: `url(${diceUrl})` }} />
      <div className="pick-card-copy">
        <h2>Tonight’s pick</h2>
        <p>Let fate decide! We’ll pick a game from your currently filtered collection.</p>
        <Button variant="accent" onClick={onPick} disabled={disabled}>
          Pick a game
        </Button>
        {disabled ? <p className="pick-card-note">Requires matching games</p> : null}
      </div>
    </aside>
  )
}
