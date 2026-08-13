import { Search } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'

type SearchFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
}

export function SearchField({ label, className, id, ...props }: SearchFieldProps) {
  return (
    <label className={['search-field', className].filter(Boolean).join(' ')}>
      <span className="visually-hidden">{label}</span>
      <Search className="search-field-icon" size={18} strokeWidth={2} aria-hidden />
      <input id={id} type="search" {...props} />
    </label>
  )
}
