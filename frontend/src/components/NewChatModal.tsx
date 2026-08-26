import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { X, Search, Users } from "lucide-react"
import { useContactsQuery } from "../api/contacts-query"
import { useChatsQuery } from "../api/chat/chats-query"
import { useCreateChatMutation } from "../api/chat/create-chat-mutation"
import { useAppContext } from "../context/AppContext"
import { queryClient } from "../api"
import styles from "./NewChatModal.module.css"

interface Props {
  onClose: () => void
}

const NewChatModal = ({ onClose }: Props) => {
  const navigate = useNavigate()

  const { phoneNumber } = useAppContext()
  const [search, setSearch] = useState("")

  const { data: contacts = [], isLoading } = useContactsQuery({ phoneNumber })
  const { data: chats = [] } = useChatsQuery({ phoneNumber })
  const { mutateAsync: createChat, isPending } = useCreateChatMutation()

  const filtered = useMemo(() => {
    const q = search.toLowerCase()

    return contacts
      .filter((c) => {
        const name = c.contactUserId.name.toLowerCase()
        const phone = c.contactUserId.phoneNumber.toLowerCase()
        return !q || name.includes(q) || phone.includes(q)
      })
      .sort((a, b) => a.contactUserId.name.localeCompare(b.contactUserId.name))
  }, [contacts, search])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>()

    for (const c of filtered) {
      const letter = (c.contactUserId.name[0] ?? "#").toUpperCase()

      if (!map.has(letter)) map.set(letter, [])

      map.get(letter)!.push(c)
    }

    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  const handleSelect = async (contactPhone: string) => {
    if (!phoneNumber) return

    const existing = chats.find((chat) =>
      chat.participants.some(
        (p) => p.phoneNumber === contactPhone && p.phoneNumber !== phoneNumber
      )
    )

    if (existing) {
      navigate(`/app/chats/${existing._id}`)
      onClose()
      return
    }

    const result = (await createChat({
      mainUserPhoneNumber: phoneNumber,
      participants: [contactPhone],
    })) as Array<{ _id: string }>

    await queryClient.invalidateQueries({ queryKey: ["chats"] })
    navigate(`/app/chats/${result[0]!._id}`)
    onClose()
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>New Chat</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search contacts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {/* Contact list */}
        <div className={styles.list}>
          {isLoading || isPending ? (
            <div className={styles.centered}>
              <div className={styles.spinner} />
            </div>
          ) : grouped.length === 0 ? (
            <div className={styles.empty}>
              <Users size={48} color="var(--light-gray)" />
              <p>No contacts found</p>
              <p className={styles.emptyHint}>
                Add contacts through the mobile app to see them here.
              </p>
            </div>
          ) : (
            grouped.map(([letter, items]) => (
              <div key={letter}>
                <div className={styles.sectionHeader}>{letter}</div>
                {items.map((contact) => (
                  <button
                    key={contact._id}
                    className={styles.contactRow}
                    onClick={() =>
                      handleSelect(contact.contactUserId.phoneNumber)
                    }
                  >
                    <div className={styles.contactAvatar}>
                      {contact.contactUserId.profilePicture ? (
                        <img
                          src={contact.contactUserId.profilePicture}
                          className={styles.contactAvatarImg}
                          alt={contact.contactUserId.name}
                        />
                      ) : (
                        <span className={styles.contactInitial}>
                          {contact.contactUserId.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className={styles.contactInfo}>
                      <span className={styles.contactName}>
                        {contact.contactUserId.name}
                      </span>
                      <span className={styles.contactPhone}>
                        {contact.contactUserId.phoneNumber}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default NewChatModal
