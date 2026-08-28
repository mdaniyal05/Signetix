import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Send, Phone, Video } from "lucide-react"
import { format } from "date-fns"
import { useChatsQuery } from "../../api/chat/chats-query"
import { useChatMessagesQuery } from "../../api/chat/chats-messages-query"
import { useContactsQuery } from "../../api/contacts-query"
import { useAppContext } from "../../context/AppContext"
import styles from "./ChatRoomPage.module.css"

const ChatRoomPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { phoneNumber, user, sendMessage, callUser } = useAppContext()

  const { data: chats = [] } = useChatsQuery({ phoneNumber })
  const { data: messages = [] } = useChatMessagesQuery(id)
  const { data: contacts = [] } = useContactsQuery({ phoneNumber })

  const chat = chats.find((c) => c._id === id)
  const otherParticipant = chat?.participants.find((p) => p._id !== user?._id)
  const otherPhone = otherParticipant?.phoneNumber ?? ""
  const otherPic = otherParticipant?.profilePicture ?? ""

  const resolvedName = (() => {
    const contact = contacts.find(
      (c) => c.contactUserId.phoneNumber === otherPhone
    )
    return contact?.contactUserId.name ?? otherPhone
  })()

  const [text, setText] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Filter out messages deleted by this user
  const visibleMessages = messages.filter(
    (m) => !(m.deletedBy && user && m.deletedBy.includes(user._id))
  )

  // Scroll to bottom whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [visibleMessages.length])

  const handleSend = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault()
      if (!text.trim() || !chat) return
      sendMessage(
        text.trim(),
        chat.participants.map((p) => p.phoneNumber),
        chat._id
      )
      setText("")
      textareaRef.current?.focus()
    },
    [text, chat, sendMessage]
  )

  // Send on Enter (Shift+Enter = newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => navigate("/app/chats")}
        >
          <ArrowLeft size={20} />
        </button>

        <div className={styles.headerUser}>
          {otherPic ? (
            <img
              src={otherPic}
              className={styles.headerAvatar}
              alt={resolvedName}
            />
          ) : (
            <div className={styles.headerAvatarFallback}>
              {resolvedName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className={styles.headerInfo}>
            <span className={styles.headerName}>{resolvedName}</span>
            {otherPhone && (
              <span className={styles.headerPhone}>{otherPhone}</span>
            )}
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.callBtn}
            title="Voice call"
            onClick={() => otherPhone && callUser("voice", otherPhone)}
            disabled={!otherPhone}
          >
            <Phone size={18} />
          </button>
          <button
            className={styles.callBtn}
            title="Video call"
            onClick={() => otherPhone && callUser("video", otherPhone)}
            disabled={!otherPhone}
          >
            <Video size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {visibleMessages.length === 0 ? (
          <div className={styles.noMessages}>
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          visibleMessages.map((msg) => {
            const isMe = msg.senderId._id === user?._id
            return (
              <div
                key={msg._id}
                className={`${styles.msgRow} ${isMe ? styles.msgRowRight : styles.msgRowLeft}`}
              >
                <div
                  className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleThem}`}
                >
                  <p className={styles.bubbleText}>{msg.content}</p>
                  <span className={styles.bubbleTime}>
                    {format(new Date(msg.createdAt), "HH:mm")}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form className={styles.inputArea} onSubmit={handleSend}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          placeholder="Type a message…"
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          type="submit"
          className={styles.sendBtn}
          disabled={!text.trim()}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}

export default ChatRoomPage
