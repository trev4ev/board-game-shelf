import type { ReactNode } from 'react'
import './RangeSlider.css'

export type RangeTick = {
  value: number
  label: string
}

type RangeSliderProps = {
  label: string
  icon?: ReactNode
  min: number
  max: number
  step?: number
  valueMin: number
  valueMax: number
  onChange: (nextMin: number, nextMax: number) => void
  formatValue?: (value: number) => string
  formatRange?: (min: number, max: number) => string
  ticks?: RangeTick[]
}

export function RangeSlider({
  label,
  icon,
  min,
  max,
  step = 1,
  valueMin,
  valueMax,
  onChange,
  formatValue = String,
  formatRange,
  ticks,
}: RangeSliderProps) {
  const span = max - min || 1
  const left = ((valueMin - min) / span) * 100
  const right = ((valueMax - min) / span) * 100
  const rangeText = formatRange
    ? formatRange(valueMin, valueMax)
    : `${formatValue(valueMin)} – ${formatValue(valueMax)}`

  return (
    <div className="range-slider">
      <div className="range-slider-header">
        <span className="range-slider-label">
          {icon}
          {label}
        </span>
        <span className="range-slider-value">{rangeText}</span>
      </div>
      <div className="range-slider-control">
        <div className="range-slider-track" aria-hidden>
          <div
            className="range-slider-fill"
            style={{ left: `${left}%`, width: `${right - left}%` }}
          />
        </div>
        <input
          type="range"
          aria-label={`${label} minimum`}
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={(event) => {
            const next = Number(event.target.value)
            onChange(Math.min(next, valueMax), valueMax)
          }}
        />
        <input
          type="range"
          aria-label={`${label} maximum`}
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={(event) => {
            const next = Number(event.target.value)
            onChange(valueMin, Math.max(next, valueMin))
          }}
        />
      </div>
      {ticks && ticks.length > 0 ? (
        <div className="range-slider-ticks" aria-hidden>
          {ticks.map((tick) => (
            <span
              key={tick.value}
              style={{ left: `${((tick.value - min) / span) * 100}%` }}
            >
              {tick.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
