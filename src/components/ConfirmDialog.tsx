import { useEffect, useId, useRef } from 'react'
import { Button } from './Button'
import './ConfirmDialog.css'

export type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      if (!dialog.open) dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onCancel()
      }}
      onClick={(event) => {
        if (busy) return
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <h2 id={titleId}>{title}</h2>
      <p id={descriptionId}>{description}</p>
      <div className="confirm-dialog-actions">
        <Button
          variant={danger ? 'danger' : 'primary'}
          onClick={onConfirm}
          disabled={busy}
          autoFocus={!danger}
        >
          {confirmLabel}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={busy} autoFocus={danger}>
          {cancelLabel}
        </Button>
      </div>
    </dialog>
  )
}
