import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  Pin,
  Reply,
  CheckCheck,
  Check,
  HandMetal,
} from "lucide-react"

const messages = [
  {
    id: "1",
    sender: "Saad Ahmed",
    text: "Hi! Are you available for a quick call today?",
    time: "10:00 AM",
    mine: false,
  },
  {
    id: "2",
    sender: "me",
    text: "Yes, I am free after 3 PM. Voice or video call?",
    time: "10:02 AM",
    mine: true,
    read: true,
  },
  {
    id: "3",
    sender: "Saad Ahmed",
    text: "Video call would be great! I also wanted to test the PSL gesture recognition feature.",
    time: "10:03 AM",
    mine: false,
  },
  {
    id: "4",
    sender: "me",
    text: "Perfect! The ML model detects PSL gestures with up to 80% confidence.",
    time: "10:05 AM",
    mine: true,
    read: true,
    pinned: true,
  },
  {
    id: "5",
    sender: "Saad Ahmed",
    text: "Does it also speak the gestures aloud automatically?",
    time: "10:06 AM",
    mine: false,
    replyTo: { sender: "me", text: "the ML model detects 11 PSL gestures..." },
  },
  {
    id: "6",
    sender: "me",
    text: "Yes! The browser Text-to-Speech API speaks the gesture name aloud. You can pick English or Urdu language in Settings.",
    time: "10:07 AM",
    mine: true,
    read: false,
  },
]

const avatarColors: Record<string, string> = {
  S: "from-[hsl(38,50%,72%)] to-[hsl(38,40%,55%)]",
  A: "from-[hsl(220,50%,55%)] to-[hsl(220,50%,40%)]",
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initial = name.charAt(0)
  const grad =
    avatarColors[initial] ?? "from-[hsl(38,50%,72%)] to-[hsl(220,50%,45%)]"
  const sz = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm"
  return (
    <div
      className={`${sz} rounded-full bg-gradient-to-br ${grad} flex flex-shrink-0 items-center justify-center font-bold text-[hsl(220,40%,13%)]`}
    >
      {initial}
    </div>
  )
}

export default function ChatPage() {
  return (
    <div
      className="flex h-screen overflow-hidden bg-[hsl(220,40%,13%)] text-[hsl(38,30%,90%)]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Ambient */}
      <div className="pointer-events-none absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-[hsl(38,50%,72%)]/5 blur-[150px]" />

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/80 px-5 py-4 backdrop-blur-xl">
          <button className="flex h-9 w-9 items-center justify-center rounded-xl text-[hsl(220,15%,55%)] transition-colors hover:bg-[hsl(220,30%,20%)] hover:text-[hsl(38,30%,90%)]">
            <ArrowLeft size={16} />
          </button>

          <div className="relative flex-shrink-0">
            <Avatar name="Saad Ahmed" size="md" />
            <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-[hsl(220,38%,16%)] bg-emerald-400" />
          </div>

          <div className="flex-1">
            <p
              className="text-sm font-semibold text-[hsl(38,30%,90%)]"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Saad Ahmed
            </p>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <p className="text-xs font-medium text-emerald-400">Online</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button className="flex h-9 w-9 items-center justify-center rounded-xl text-[hsl(220,15%,55%)] transition-colors hover:bg-[hsl(220,30%,20%)] hover:text-[hsl(38,30%,90%)]">
              <Phone size={16} />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl text-[hsl(38,50%,72%)] transition-colors hover:bg-[hsl(38,50%,72%)]/15 hover:text-[hsl(38,50%,60%)]">
              <Video size={16} />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl text-[hsl(220,15%,55%)] transition-colors hover:bg-[hsl(220,30%,20%)] hover:text-[hsl(38,30%,90%)]">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* Pinned message bar */}
        {/* <div className="flex items-center gap-3 border-b border-[hsl(38,50%,72%)]/15 bg-[hsl(38,50%,72%)]/8 px-5 py-2.5">
          <Pin size={12} className="flex-shrink-0 text-[hsl(38,50%,72%)]" />
          <p className="truncate font-mono text-xs text-[hsl(38,50%,72%)]">
            <span className="font-semibold">Pinned: </span>
            The ML model detects 11 PSL gestures with up to 95% confidence.
          </p>
        </div> */}

        {/* PSL AI indicator */}
        <div className="flex items-center gap-2 border-b border-[hsl(220,50%,45%)]/20 bg-[hsl(220,50%,45%)]/10 px-5 py-2">
          <HandMetal size={11} className="text-[hsl(220,50%,65%)]" />
          <span className="font-mono text-xs text-[hsl(220,50%,65%)]">
            PSL AI ready. Start a video call for live gesture recognition
          </span>
        </div>

        {/* Messages */}
        <div
          className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
          style={{ background: "hsl(220,40%,11%)" }}
        >
          {/* Date separator */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[hsl(220,25%,22%)]/50" />
            <span className="font-mono text-xs text-[hsl(220,15%,40%)]">
              Today
            </span>
            <div className="h-px flex-1 bg-[hsl(220,25%,22%)]/50" />
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.mine ? "justify-end" : "justify-start"} group`}
            >
              <div
                className={`flex max-w-sm items-end gap-2 ${msg.mine ? "flex-row-reverse" : ""}`}
              >
                {!msg.mine && <Avatar name={msg.sender} size="sm" />}

                <div className="space-y-1">
                  {/* Reply preview */}
                  {msg.replyTo && (
                    <div className="rounded-xl border-l-2 border-[hsl(38,50%,72%)] bg-[hsl(38,50%,72%)]/8 px-3 py-1.5 text-xs text-[hsl(220,15%,55%)]">
                      <span className="block font-medium text-[hsl(38,50%,72%)]">
                        {msg.replyTo.sender}
                      </span>
                      <span className="block truncate">{msg.replyTo.text}</span>
                    </div>
                  )}

                  <div
                    className={`relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.mine
                        ? "rounded-br-sm bg-[hsl(38,50%,72%)] font-medium text-[hsl(220,40%,13%)]"
                        : "rounded-bl-sm border border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/70 text-[hsl(38,30%,90%)]"
                    }`}
                  >
                    {msg.text}

                    {/* Hover actions */}
                    <div
                      className={`absolute top-1/2 flex -translate-y-1/2 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 ${msg.mine ? "-left-16" : "-right-16"}`}
                    >
                      <button className="flex h-6 w-6 items-center justify-center rounded-lg border border-[hsl(220,25%,22%)] bg-[hsl(220,38%,16%)] text-[hsl(220,15%,55%)] transition-colors hover:text-[hsl(38,50%,72%)]">
                        <Reply size={11} />
                      </button>
                      <button className="flex h-6 w-6 items-center justify-center rounded-lg border border-[hsl(220,25%,22%)] bg-[hsl(220,38%,16%)] text-[hsl(220,15%,55%)] transition-colors hover:text-[hsl(38,50%,72%)]">
                        <Pin size={11} />
                      </button>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-1 ${msg.mine ? "justify-end" : ""}`}
                  >
                    <span className="text-xs text-[hsl(220,15%,40%)]">
                      {msg.time}
                    </span>
                    {msg.mine &&
                      ("read" in msg && msg.read ? (
                        <CheckCheck
                          size={12}
                          className="text-[hsl(38,50%,72%)]"
                        />
                      ) : (
                        <Check size={12} className="text-[hsl(220,15%,40%)]" />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <div className="border-t border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/80 px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-3 rounded-2xl border border-[hsl(220,25%,22%)] bg-[hsl(220,30%,20%)] px-4 py-2.5">
            <button className="text-[hsl(220,15%,45%)] transition-colors hover:text-[hsl(38,50%,72%)]">
              <Paperclip size={17} />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              defaultValue="That sounds amazing! How accurate is it?"
              className="flex-1 bg-transparent text-sm text-[hsl(38,30%,90%)] placeholder:text-[hsl(220,15%,40%)] focus:outline-none"
            />
            <button className="text-[hsl(220,15%,45%)] transition-colors hover:text-yellow-400">
              <Smile size={17} />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-xl bg-[hsl(38,50%,72%)] shadow-[0_0_20px_-5px_hsl(38,50%,72%,0.5)] transition-colors hover:bg-[hsl(38,50%,65%)]">
              <Send size={14} className="text-[hsl(220,40%,13%)]" />
            </button>
          </div>
          {/* <p className="mt-2 text-center font-mono text-xs text-[hsl(220,15%,35%)]">
            Messages are end-to-end encrypted
          </p> */}
        </div>
      </div>
    </div>
  )
}
