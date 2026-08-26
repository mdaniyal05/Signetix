import { useNavigate } from "react-router-dom"
import { Archive } from "lucide-react"
import { format } from "date-fns"
import { useChatsQuery } from "../../api/chat/chats-query"
import { useContactsQuery } from "../../api/contacts-query"
import { useAppContext } from "../../context/AppContext"
import { archiveChat } from "../../api/chat/archive-chat-mutation"
import { deleteChat } from "../../api/chat/delete-chat-mutation"
import { queryClient } from "../../api"
import ChatRowMenu from "../../components/ChatRowMenu"
import styles from "./ChatsPage.module.css"

const ArchivedChatsPage = () => {
  const navigate = useNavigate()

  const { phoneNumber, chatsSearchQuery, user } = useAppContext()
  const { data: chats = [], isPending } = useChatsQuery({ phoneNumber })
  const { data: contacts = [] } = useContactsQuery({ phoneNumber })

  const resolveName = (phone: string) => {
    const contact = contacts.find((c) => c.contactUserId.phoneNumber === phone)
    return contact?.contactUserId.name ?? phone
  }

  const archivedRows = chats
    .filter((c) => user && c.archivedBy.includes(user._id))
    .filter((c) => c.totalNumberOfMessagesInChat > 0)
    .map((c) => {
      const other = c.participants.find((p) => p._id !== user?._id)

      return {
        ...c,
        displayName: resolveName(other?.phoneNumber ?? ""),
        otherPic: other?.profilePicture ?? "",
      }
    })
    .filter((c) => {
      if (!chatsSearchQuery) return true
      return c.displayName
        .toLowerCase()
        .includes(chatsSearchQuery.toLowerCase())
    })

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>Archived Chats</h2>
        </div>
      </div>

      <div className={styles.list}>
        {isPending ? (
          <div className={styles.centered}>
            <div className={styles.spinner} />
          </div>
        ) : archivedRows.length === 0 ? (
          <div className={styles.empty}>
            <Archive size={64} color="var(--light-gray)" />
            <p className={styles.emptyTitle}>No Archived Chats</p>
            <p className={styles.emptySubtitle}>
              Chats you archive will appear here.
            </p>
            <button
              className={styles.newChatBtn}
              style={{
                width: "auto",
                height: "auto",
                borderRadius: 20,
                padding: "8px 20px",
              }}
              onClick={() => navigate("/app/chats")}
            >
              Go to Chats
            </button>
          </div>
        ) : (
          archivedRows.map((chat) => {
            const msg = (chat.lastMessage ?? "").split("\n").pop() ?? ""
            return (
              <ChatRowMenu
                key={chat._id}
                chatId={chat._id}
                userPhoneNumber={phoneNumber!}
                isArchived={true}
                isPinned={false}
                onArchive={() => {
                  archiveChat({
                    userPhoneNumber: phoneNumber!,
                    chatId: chat._id,
                    isArchived: false,
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
                onPin={() => {}}
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
      </div>
    </div>
  )
}

export default ArchivedChatsPage
