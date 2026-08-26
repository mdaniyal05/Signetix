import { useState } from "react"
import { Check, X, Pencil } from "lucide-react"
import styles from "./EditableField.module.css"

interface Props {
  value: string
  onSave: (value: string) => void
  size?: "large" | "small"
  name: string
  max?: number
}

const EditableField = ({ value, onSave, size = "small", name, max }: Props) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [error, setError] = useState("")

  const startEdit = () => {
    setDraft(value)
    setError("")
    setEditing(true)
  }

  const cancelEdit = () => {
    setDraft(value)
    setError("")
    setEditing(false)
  }

  const confirmEdit = () => {
    if (max && draft.length > max) {
      setError(`Maximum ${max} characters allowed`)

      return
    }

    onSave(draft)
    setEditing(false)
    setError("")
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") confirmEdit()
    if (e.key === "Escape") cancelEdit()
  }

  return (
    <div className={styles.wrap}>
      {editing ? (
        <div className={styles.editRow}>
          <input
            className={`${styles.input} ${size === "large" ? styles.large : styles.small}`}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              if (max && e.target.value.length > max) {
                setError(`Maximum ${max} characters allowed`)
              } else {
                setError("")
              }
            }}
            onKeyDown={handleKey}
            autoFocus
            placeholder={`Set ${name}`}
          />
          <button className={styles.iconBtn} onClick={confirmEdit} title="Save">
            <Check size={16} color="var(--primary)" />
          </button>
          <button
            className={styles.iconBtn}
            onClick={cancelEdit}
            title="Cancel"
          >
            <X size={16} color="var(--red)" />
          </button>
        </div>
      ) : (
        <div className={styles.displayRow} onClick={startEdit}>
          <span
            className={`${styles.text} ${size === "large" ? styles.large : styles.small}`}
          >
            {value || <span className={styles.placeholder}>Set {name}</span>}
          </span>
          <Pencil size={13} className={styles.pencil} />
        </div>
      )}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}

export default EditableField
