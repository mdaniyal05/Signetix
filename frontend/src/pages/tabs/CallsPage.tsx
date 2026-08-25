import { useEffect } from "react"
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Trash2,
  Video,
} from "lucide-react"
import dayjs from "dayjs"
import { useCallHistoryQuery } from "../../api/call/call-history-query"
import { useDeleteCallMutation } from "../../api/call/delete-call-mutation"
import { useContactsQuery } from "../../api/contacts-query"
import { useAppContext } from "../../context/AppContext"
import { sanitizePhoneNumber, formatDuration } from "../../constants/Utils"
import styles from "./CallsPage.module.css"

const CallsPage = () => {
  const { phoneNumber, callSearchQuery, setCallSearchQuery, user, callUser } =
    useAppContext()
  const { data: callData = [] } = useCallHistoryQuery({ phoneNumber })
  const { data: contacts = [] } = useContactsQuery({ phoneNumber })
  const { mutate: deleteCall } = useDeleteCallMutation()

  useEffect(() => () => setCallSearchQuery(""), [setCallSearchQuery])

  const resolveName = (phone: string) => {
    const contact = contacts.find(
      (c) =>
        sanitizePhoneNumber(c.contactUserId.phoneNumber) ===
        sanitizePhoneNumber(phone)
    )

    return contact?.contactUserId.name ?? phone
  }

  const calls = callData
    .filter((entry) => {
      if (entry.deletedBy && user && entry.deletedBy.includes(user._id))
        return false
      return true
    })
    .map((entry) => {
      const other = entry.participants.find(
        (p) => p.phoneNumber !== phoneNumber
      )

      const name =
        resolveName(other?.phoneNumber ?? "") || other?.name || "Unknown"

      return {
        id: entry._id,
        name,
        avatar: other?.profilePicture,
        type: entry.callType as "incoming" | "outgoing" | "missed" | "video",
        duration: formatDuration(entry.callDurationInSeconds),
        timeOfCall: entry.createdAt,
        isVideo: entry.callType === "video",
        missed: entry.callType === "missed",
        otherPhone: other?.phoneNumber ?? "",
      }
    })
    .filter((c) => {
      if (!callSearchQuery) return true
      const q = callSearchQuery.toLowerCase()
      return (
        c.name.toLowerCase().includes(q) ||
        c.otherPhone.toLowerCase().includes(q)
      )
    })
    .sort((a, b) =>
      dayjs(a.timeOfCall).isBefore(dayjs(b.timeOfCall)) ? 1 : -1
    )

  const CallIcon = ({ type }: { type: string }) => {
    if (type === "missed") return <PhoneMissed size={16} color="var(--red)" />
    if (type === "incoming") return <PhoneIncoming size={16} color="#388e3c" />

    return <PhoneOutgoing size={16} color="var(--primary)" />
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Calls</h2>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search calls…"
          value={callSearchQuery}
          onChange={(e) => setCallSearchQuery(e.target.value)}
        />
      </div>

      {/* List */}
      <div className={styles.list}>
        {calls.length === 0 ? (
          <div className={styles.empty}>
            <Phone size={64} color="var(--light-gray)" />
            <p className={styles.emptyTitle}>No Calls Yet</p>
            <p className={styles.emptySubtitle}>
              Your recent calls will show up here.
            </p>
          </div>
        ) : (
          calls.map((call) => (
            <div key={call.id} className={styles.callRow}>
              {/* Avatar */}
              <div className={styles.avatarWrap}>
                {call.avatar ? (
                  <img
                    src={call.avatar}
                    className={styles.avatar}
                    alt={call.name}
                  />
                ) : (
                  <div className={styles.avatarFallback}>
                    {call.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className={styles.callInfo}>
                <div className={styles.callName}>{call.name}</div>
                <div className={styles.callMeta}>
                  <CallIcon type={call.type} />
                  <span
                    className={`${styles.callType} ${call.missed ? styles.missed : ""}`}
                  >
                    {call.type.charAt(0).toUpperCase() + call.type.slice(1)}{" "}
                    &mdash; {call.isVideo ? "Video" : "Voice"}
                  </span>
                  <span className={styles.callDuration}>· {call.duration}</span>
                </div>
                <div className={styles.callTime}>
                  {dayjs(call.timeOfCall).format("hh:mm:ss a · DD/MM/YYYY")}
                </div>
              </div>

              {/* Actions */}
              <div className={styles.callActions}>
                <button
                  className={styles.actionBtn}
                  title="Voice call"
                  onClick={() => callUser("voice", call.otherPhone)}
                  disabled={!call.otherPhone}
                >
                  <Phone size={18} />
                </button>
                <button
                  className={styles.actionBtn}
                  title="Video call"
                  onClick={() => callUser("video", call.otherPhone)}
                  disabled={!call.otherPhone}
                >
                  <Video size={18} />
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  title="Delete call"
                  onClick={() => {
                    if (confirm("Delete this call from history?")) {
                      deleteCall({
                        phoneNumber: phoneNumber!,
                        callHistoryLogIds: [call.id],
                      })
                    }
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CallsPage
