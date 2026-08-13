import { Check } from 'lucide-react'
import type { InputHTMLAttributes, ReactNode } from 'react'

type ChipProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  checked: boolean
  children: ReactNode
}

export function Chip({ checked, children, className, ...props }: ChipProps) {
  return (
    <label className={['chip', checked ? 'on' : '', className].filter(Boolean).join(' ')}>
      <input type="checkbox" {...props} checked={checked} />
      {checked ? <Check size={14} strokeWidth={2.5} aria-hidden /> : null}
      {children}
    </label>
  )
}
