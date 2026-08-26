import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { MessageSquare, Plus, Archive } from "lucide-react"
import { format } from "date-fns"
import { useChatsQuery } from "../../api/chat/chats-query"
import { useContactsQuery } from "../../api/contacts-query"
import { useAppContext } from "../../context/AppContext"
import { archiveChat } from "../../api/chat/archive-chat-mutation"
import { deleteChat } from "../../api/chat/delete-chat-mutation"
import { pinChat } from "../../api/chat/pin-chat-mutation"
import { queryClient } from "../../api"
import NewChatModal from "../../components/NewChatModal"
import ChatRowMenu from "../../components/ChatRowMenu"
import styles from "./ChatsPage.module.css"

const ChatsPage = () => {
  const navigate = useNavigate()

  const { phoneNumber, chatsSearchQuery, setChatsSearchQuery, user } =
    useAppContext()
  const { data: chats = [], isPending } = useChatsQuery({ phoneNumber })
  const { data: contacts = [] } = useContactsQuery({ phoneNumber })
  const [showNewChat, setShowNewChat] = useState(false)

  useEffect(() => () => setChatsSearchQuery(""), [setChatsSearchQuery])

  const resolveName = (phone: string) => {
    const contact = contacts.find((c) => c.contactUserId.phoneNumber === phone)

    return contact?.contactUserId.name ?? phone
  }

  const archivedCount = chats.filter(
    (c) => user && c.archivedBy.includes(user._id)
  ).length

  const chatRows = chats
    .filter((c) => c.totalNumberOfMessagesInChat > 0)
    .filter(
      (c) =>
        !(
          user &&
          (c.archivedBy.includes(user._id) || c.deletedBy.includes(user._id))
        )
    )
    .map((c) => {
      const other = c.participants.find((p) => p._id !== user?._id)
      const displayName = resolveName(other?.phoneNumber ?? "")
      return {
        ...c,
        displayName,
        otherPhone: other?.phoneNumber ?? "",
        otherPic: other?.profilePicture ?? "",
      }
    })
    .filter((c) => {
      if (!chatsSearchQuery) return true
      return c.displayName
        .toLowerCase()
        .includes(chatsSearchQuery.toLowerCase())
    })
    .sort((a, b) => {
      const aPinned = user ? a.pinnedBy.includes(user._id) : false
      const bPinned = user ? b.pinnedBy.includes(user._id) : false

      if (aPinned && !bPinned) return -1
      if (!aPinned && bPinned) return 1

      return 0
    })

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>Chats</h2>
        </div>
        <div className={styles.headerRight}>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search chats…"
            value={chatsSearchQuery}
            onChange={(e) => setChatsSearchQuery(e.target.value)}
          />
          <button
            className={styles.newChatBtn}
            onClick={() => setShowNewChat(true)}
            title="New chat"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className={styles.list}>
        {isPending ? (
          <div className={styles.centered}>
            <div className={styles.spinner} />
          </div>
        ) : chatRows.length === 0 ? (
          <div className={styles.empty}>
            <MessageSquare size={64} color="var(--light-gray)" />
            <p className={styles.emptyTitle}>No Chats Yet</p>
            <p className={styles.emptySubtitle}>
              Tap + to start a new conversation.
            </p>
          </div>
        ) : (
          chatRows.map((chat) => {
            const isPinned = user ? chat.pinnedBy.includes(user._id) : false
            const msg = (chat.lastMessage ?? "").split("\n").pop() ?? ""
            return (
              <ChatRowMenu
                key={chat._id}
                chatId={chat._id}
                userPhoneNumber={phoneNumber!}
                isArchived={false}
                isPinned={isPinned}
                onArchive={() => {
                  archiveChat({
                    userPhoneNumber: phoneNumber!,
                    chatId: chat._id,
                    isArchived: true,
                  })
                    .then(() =>
                      queryClient.invalidateQueries({ queryKey: ["chats"] })
                    )
                    .catch(console.error)
                }}
                onDelete={() => {
                  if (confirm("Delete this chat?")) {
                    deleteChat({
                      userPhoneNumber: phoneNumber!,
                      chatId: chat._id,
                    }).catch(console.error)
                  }
                }}
                onPin={() => {
                  pinChat({
                    userPhoneNumber: phoneNumber!,
                    chatId: chat._id,
                    isPinned: !isPinned,
                  })
                    .then(() =>
                      queryClient.invalidateQueries({ queryKey: ["chats"] })
                    )
                    .catch(console.error)
                }}
              >
                <button
                  className={styles.chatRow}
                  onClick={() => navigate(`/app/chats/${chat._id}`)}
                >
                  <div className={styles.avatarWrap}>
                    {chat.otherPic ? (
                      <img
                        src={chat.otherPic}
                        className={styles.avatar}
                        alt={chat.displayName}
                      />
                    ) : (
                      <div className={styles.avatarFallback}>
                        {chat.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={styles.chatInfo}>
                    <div className={styles.chatTop}>
                      <span className={styles.chatName}>
                        {isPinned && (
                          <span className={styles.pinIcon}>Pin</span>
                        )}
                        {chat.displayName}
                      </span>
                      <span className={styles.chatDate}>
                        {format(new Date(chat.createdAt), "MM/dd/yy")}
                      </span>
                    </div>
                    <p className={styles.chatMsg}>
                      {msg.length > 50
                        ? `${msg.substring(0, 50)}…`
                        : msg || " "}
                    </p>
                  </div>
                </button>
              </ChatRowMenu>
            )
          })
        )}

        {/* Archived button */}
        {archivedCount > 0 && (
          <button
            className={styles.archivedBtn}
            onClick={() => navigate("/app/chats/archived")}
          >
            <Archive size={18} />
            <span>Archived Chats ({archivedCount})</span>
          </button>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} />}
    </div>
  )
}

export default ChatsPage
