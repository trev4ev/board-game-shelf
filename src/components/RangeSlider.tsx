import './RangeSlider.css'

type RangeSliderProps = {
  label: string
  min: number
  max: number
  step?: number
  valueMin: number
  valueMax: number
  onChange: (nextMin: number, nextMax: number) => void
  formatValue?: (value: number) => string
}

export function RangeSlider({
  label,
  min,
  max,
  step = 1,
  valueMin,
  valueMax,
  onChange,
  formatValue = String,
}: RangeSliderProps) {
  const span = max - min || 1
  const left = ((valueMin - min) / span) * 100
  const right = ((valueMax - min) / span) * 100

  return (
    <div className="range-slider">
      <div className="range-slider-header">
        <span className="range-slider-label">{label}</span>
        <span className="range-slider-value">
          {formatValue(valueMin)} – {formatValue(valueMax)}
        </span>
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
    </div>
  )
}