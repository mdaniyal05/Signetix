import { useState, useRef, useEffect, type ReactNode } from "react"
import { Pin, PinOff, Archive, ArchiveRestore, Trash2 } from "lucide-react"
import styles from "./ChatRowMenu.module.css"

interface Props {
  children: ReactNode
  chatId: string
  userPhoneNumber: string
  isArchived: boolean
  isPinned: boolean
  onArchive: () => void
  onDelete: () => void
  onPin: () => void
}

const ChatRowMenu = ({
  children,
  isArchived,
  isPinned,
  onArchive,
  onDelete,
  onPin,
}: Props) => {
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setMenuPos({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    if (!menuPos) return

    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuPos(null)
      }
    }

    document.addEventListener("mousedown", handler)

    return () => document.removeEventListener("mousedown", handler)
  }, [menuPos])

  const run = (fn: () => void) => {
    setMenuPos(null)
    fn()
  }

  return (
    <div className={styles.wrapper} onContextMenu={handleContextMenu}>
      {children}

      {menuPos && (
        <div
          ref={menuRef}
          className={styles.menu}
          style={{ top: menuPos.y, left: menuPos.x }}
        >
          <button className={styles.menuItem} onClick={() => run(onPin)}>
            {isPinned ? <PinOff size={15} /> : <Pin size={15} />}
            <span>{isPinned ? "Unpin" : "Pin"}</span>
          </button>
          <button className={styles.menuItem} onClick={() => run(onArchive)}>
            {isArchived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
            <span>{isArchived ? "Unarchive" : "Archive"}</span>
          </button>
          <div className={styles.divider} />
          <button
            className={`${styles.menuItem} ${styles.danger}`}
            onClick={() => run(onDelete)}
          >
            <Trash2 size={15} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default ChatRowMenu
