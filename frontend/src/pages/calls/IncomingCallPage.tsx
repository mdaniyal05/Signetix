import { useNavigate, useSearchParams } from "react-router-dom"
import { Phone, PhoneOff } from "lucide-react"
import { useAppContext } from "../../context/AppContext"
import styles from "./CallPage.module.css"

const IncomingCallPage = () => {
  const navigate = useNavigate()

  const [params] = useSearchParams()
  const callType = params.get("callType") ?? "voice"
  const { call, declineCall, incomingCallUser, sendMeetingAccepted } =
    useAppContext()

  const displayName = incomingCallUser ?? "Unknown Caller"
  const initial = displayName.charAt(0).toUpperCase()

  const onAccept = () => {
    if (!call) return
    sendMeetingAccepted()

    if (callType === "video") {
      navigate(`/video-call?meetingId=${call.meetingId}`, { replace: true })
    } else {
      navigate(`/voice-call?meetingId=${call.meetingId}`, { replace: true })
    }
  }

  const onDecline = () => {
    declineCall()
    navigate(-1)
  }

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <div className={styles.avatar}>{initial}</div>
        <h2 className={styles.name}>{displayName}</h2>
        <p className={styles.subtitle}>
          Incoming {callType === "video" ? "video" : "voice"} call…
        </p>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.declineBtn}
          onClick={onDecline}
          title="Decline"
        >
          <PhoneOff size={28} />
          <span>Decline</span>
        </button>
        <button className={styles.acceptBtn} onClick={onAccept} title="Accept">
          <Phone size={28} />
          <span>Accept</span>
        </button>
      </div>
    </div>
  )
}

export default IncomingCallPage
