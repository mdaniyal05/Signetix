import {
  MessageSquare,
  Phone,
  Video,
  Search,
  Settings,
  Archive,
  Pin,
  Users,
  HandMetal,
  Bell,
  TrendingUp,
} from "lucide-react"

const chats = [
  {
    id: "1",
    name: "Sara Ahmed",
    last: "Sure, let me check that for you",
    time: "2m",
    unread: 3,
    pinned: false,
    online: true,
  },
  {
    id: "2",
    name: "Usman Khan",
    last: "The meeting is at 3 PM today",
    time: "18m",
    unread: 1,
    pinned: false,
    online: true,
  },
  {
    id: "3",
    name: "Fatima Ali",
    last: "Thanks for sharing the document!",
    time: "1h",
    unread: 0,
    pinned: false,
    online: false,
  },
  {
    id: "4",
    name: "Ahmed Raza",
    last: "Can you call me when you are free?",
    time: "3h",
    unread: 0,
    pinned: false,
    online: false,
  },
  {
    id: "5",
    name: "Zainab Malik",
    last: "I will join the video call now",
    time: "Yest",
    unread: 0,
    pinned: false,
    online: false,
  },
]

const calls = [
  {
    id: "1",
    name: "Sara Ahmed",
    type: "video",
    dir: "incoming",
    time: "Today, 10:30 AM",
    dur: "12m 34s",
  },
  {
    id: "2",
    name: "Usman Khan",
    type: "voice",
    dir: "outgoing",
    time: "Today, 9:15 AM",
    dur: "5m 02s",
  },
  // {
  //   id: "3",
  //   name: "Ahmed Raza",
  //   type: "video",
  //   dir: "missed",
  //   time: "Yesterday, 4:20 PM",
  //   dur: "—",
  // },
]

const avatarColors: Record<string, string> = {
  S: "from-[hsl(38,50%,72%)] to-[hsl(38,40%,55%)]",
  U: "from-[hsl(220,50%,55%)] to-[hsl(220,50%,40%)]",
  F: "from-[hsl(280,50%,60%)] to-[hsl(280,50%,45%)]",
  A: "from-[hsl(160,50%,50%)] to-[hsl(160,50%,38%)]",
  Z: "from-[hsl(340,50%,60%)] to-[hsl(340,50%,45%)]",
}

function Avatar({
  name,
  online,
  size = "md",
}: {
  name: string
  online?: boolean
  size?: "sm" | "md" | "lg"
}) {
  const initial = name.charAt(0)
  const grad =
    avatarColors[initial] ?? "from-[hsl(38,50%,72%)] to-[hsl(220,50%,45%)]"
  const sz =
    size === "sm"
      ? "h-8 w-8 text-xs"
      : size === "lg"
        ? "h-12 w-12 text-base"
        : "h-10 w-10 text-sm"
  return (
    <div className="relative flex-shrink-0">
      <div
        className={`${sz} rounded-full bg-gradient-to-br ${grad} flex items-center justify-center font-bold text-[hsl(220,40%,13%)]`}
      >
        {initial}
      </div>
      {online !== undefined && (
        <span
          className={`absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-[hsl(220,38%,16%)] ${online ? "bg-emerald-400" : "bg-[hsl(220,15%,40%)]"}`}
        />
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div
      className="flex h-screen overflow-hidden bg-[hsl(220,40%,13%)] text-[hsl(38,30%,90%)]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* ── SIDEBAR ── */}
      <aside className="flex w-64 flex-col border-r border-[hsl(220,25%,22%)]/50 bg-[hsl(220,40%,11%)]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 border-b border-[hsl(220,25%,22%)]/50 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(38,50%,72%)] to-[hsl(220,50%,45%)] shadow-[0_0_20px_-5px_hsl(38,50%,72%,0.5)]">
            <HandMetal size={16} className="text-[hsl(220,40%,13%)]" />
          </div>
          <span
            className="bg-gradient-to-r from-[hsl(38,50%,72%)] to-[hsl(220,50%,65%)] bg-clip-text text-lg font-bold text-transparent"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Signetix
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {[
            {
              icon: <MessageSquare size={16} />,
              label: "Chats",
              active: true,
              badge: 4,
            },
            {
              icon: <Phone size={16} />,
              label: "Calls",
              active: false,
              badge: 0,
            },
            {
              icon: <Users size={16} />,
              label: "Contacts",
              active: false,
              badge: 0,
            },
            // {
            //   icon: <Archive size={16} />,
            //   label: "Archived",
            //   active: false,
            //   badge: 2,
            // },
          ].map((item) => (
            <button
              key={item.label}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                item.active
                  ? "border border-[hsl(38,50%,72%)]/20 bg-[hsl(38,50%,72%)]/15 text-[hsl(38,50%,72%)]"
                  : "text-[hsl(220,15%,55%)] hover:bg-[hsl(220,30%,20%)] hover:text-[hsl(38,30%,90%)]"
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                {item.label}
              </div>
              {item.badge > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[hsl(38,50%,72%)] px-1 text-xs font-bold text-[hsl(220,40%,13%)]">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Stats */}
        <div className="px-3 pb-3">
          <div className="rounded-xl border border-[hsl(220,25%,22%)]/50 bg-[hsl(220,30%,20%)] p-3">
            <p className="mb-2 flex items-center gap-1.5 font-mono text-xs tracking-wider text-[hsl(38,50%,72%)] uppercase">
              <TrendingUp size={11} /> PSL AI Status
            </p>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-xs text-[hsl(38,30%,85%)]">
                Model Active
              </span>
            </div>
            {/* <p className="mt-1 text-xs text-[hsl(220,15%,45%)]">
              11 gestures · % accuracy
            </p> */}
          </div>
        </div>

        {/* User */}
        <div className="border-t border-[hsl(220,25%,22%)]/50 px-3 py-3">
          <div className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-[hsl(220,30%,20%)]">
            <Avatar name="Ali Hassan" size="sm" online={true} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[hsl(38,30%,90%)]">
                Muhammad Daniyal
              </p>
              <p className="truncate text-xs text-[hsl(220,15%,45%)]">
                +92 300 1234567
              </p>
            </div>
            <Settings
              size={14}
              className="flex-shrink-0 text-[hsl(220,15%,45%)]"
            />
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/80 px-6 py-4 backdrop-blur-xl">
          <div>
            <h1
              className="text-lg font-bold text-[hsl(38,30%,90%)]"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              Chats
            </h1>
            <p className="text-xs text-[hsl(220,15%,45%)]">
              5 conversations · 4 unread
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                size={14}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-[hsl(220,15%,45%)]"
              />
              <input
                type="text"
                placeholder="Search chats..."
                className="h-9 w-52 rounded-xl border border-[hsl(220,25%,22%)] bg-[hsl(220,30%,20%)] pr-4 pl-9 text-sm text-[hsl(38,30%,90%)] transition-colors placeholder:text-[hsl(220,15%,40%)] focus:border-[hsl(38,50%,72%)] focus:outline-none"
              />
            </div>
            <button className="relative rounded-xl p-2 text-[hsl(220,15%,55%)] transition-colors hover:bg-[hsl(220,30%,20%)] hover:text-[hsl(38,30%,90%)]">
              <Bell size={16} />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[hsl(38,50%,72%)]" />
            </button>
            <button className="h-9 rounded-xl bg-[hsl(38,50%,72%)] px-4 text-sm font-semibold text-[hsl(220,40%,13%)] shadow-[0_0_20px_-5px_hsl(38,50%,72%,0.4)] transition-colors hover:bg-[hsl(38,50%,65%)]">
              New Chat
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Chat list */}
          <div className="w-80 overflow-y-auto border-r border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/30">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="group flex cursor-pointer items-center gap-3 border-b border-[hsl(220,25%,22%)]/30 px-4 py-3.5 transition-colors hover:bg-[hsl(220,30%,20%)]/60"
              >
                <Avatar name={chat.name} size="md" online={chat.online} />
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {chat.pinned && (
                        <Pin size={11} className="text-[hsl(38,50%,72%)]" />
                      )}
                      <span className="text-sm font-medium text-[hsl(38,30%,90%)]">
                        {chat.name}
                      </span>
                    </div>
                    <span className="text-xs text-[hsl(220,15%,45%)]">
                      {chat.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="truncate pr-2 text-xs text-[hsl(220,15%,50%)]">
                      {chat.last}
                    </p>
                    {chat.unread > 0 && (
                      <span className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(38,50%,72%)] px-1 text-xs font-bold text-[hsl(220,40%,13%)]">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right panel */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Call history */}
            <div className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-mono text-sm font-semibold tracking-wider text-[hsl(38,50%,72%)] uppercase">
                  Recent Calls
                </h2>
                <button className="text-xs text-[hsl(220,15%,50%)] transition-colors hover:text-[hsl(38,30%,90%)]">
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {calls.map((call) => (
                  <div
                    key={call.id}
                    className="flex items-center gap-4 rounded-2xl border border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/40 p-4 backdrop-blur-xl transition-all hover:shadow-[0_0_30px_-10px_hsl(38,50%,72%,0.2)]"
                  >
                    <Avatar name={call.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[hsl(38,30%,90%)]">
                        {call.name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${
                            call.dir === "missed"
                              ? "border-red-500/30 bg-red-500/10 text-red-400"
                              : call.dir === "incoming"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                : "border-[hsl(38,50%,72%)]/30 bg-[hsl(38,50%,72%)]/10 text-[hsl(38,50%,72%)]"
                          }`}
                        >
                          {call.dir}
                        </span>
                        <span className="text-xs text-[hsl(220,15%,45%)]">
                          {call.time}
                        </span>
                        <span className="text-xs text-[hsl(220,15%,45%)]">
                          · {call.dur}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex h-8 w-8 items-center justify-center rounded-xl bg-[hsl(220,30%,20%)] text-[hsl(220,15%,55%)] transition-all hover:bg-[hsl(220,25%,25%)] hover:text-[hsl(38,30%,90%)]">
                        <Phone size={14} />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-xl border border-[hsl(38,50%,72%)]/20 bg-[hsl(38,50%,72%)]/10 text-[hsl(38,50%,72%)] transition-all hover:bg-[hsl(38,50%,72%)]/20">
                        <Video size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div>
              <h2 className="mb-4 font-mono text-sm font-semibold tracking-wider text-[hsl(38,50%,72%)] uppercase">
                Quick Actions
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    label: "New Chat",
                    icon: <MessageSquare size={20} />,
                    accent: "hsl(38,50%,72%)",
                    bg: "hsl(38,50%,72%,0.1)",
                    border: "hsl(38,50%,72%,0.2)",
                  },
                  {
                    label: "Voice Call",
                    icon: <Phone size={20} />,
                    accent: "hsl(160,50%,50%)",
                    bg: "hsl(160,50%,50%,0.1)",
                    border: "hsl(160,50%,50%,0.2)",
                  },
                  {
                    label: "Video Call",
                    icon: <Video size={20} />,
                    accent: "hsl(220,50%,65%)",
                    bg: "hsl(220,50%,65%,0.1)",
                    border: "hsl(220,50%,65%,0.2)",
                  },
                ].map((a) => (
                  <div
                    key={a.label}
                    className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-[hsl(220,25%,22%)]/50 bg-[hsl(220,38%,16%)]/40 p-5 transition-all duration-200 hover:scale-105"
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{
                        background: `hsl(${a.accent.replace("hsl(", "").replace(")", "")} / 0.15)`,
                      }}
                    >
                      <span style={{ color: a.accent }}>{a.icon}</span>
                    </div>
                    <span className="text-xs font-medium text-[hsl(38,30%,85%)]">
                      {a.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
