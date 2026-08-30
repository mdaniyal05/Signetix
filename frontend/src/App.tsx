import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AppProvider } from "./context/AppContext"
import { getStorageValue } from "./context/storage"

// Auth pages
import LoginPage from "./pages/auth/LoginPage"
import SignupPage from "./pages/auth/SignupPage"
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"
import VerifyPage from "./pages/auth/VerifyPage"

// App shell + tabs
import AppLayout from "./pages/AppLayout"
import ChatsPage from "./pages/tabs/ChatsPage"
import ChatRoomPage from "./pages/tabs/ChatRoomPage"
import ArchivedChatsPage from "./pages/tabs/ArchivedChatsPage"
import CallsPage from "./pages/tabs/CallsPage"
import SettingsPage from "./pages/tabs/SettingsPage"

// Call screens
import IncomingCallPage from "./pages/calls/IncomingCallPage"
import VideoCallPage from "./pages/calls/VideoCallPage"
import VoiceCallPage from "./pages/calls/VoiceCallPage"

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const user = getStorageValue("user")

  if (!user) return <Navigate to="/" replace />

  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* Auth */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify/:phone" element={<VerifyPage />} />

          {/* Authenticated app */}
          <Route
            path="/app"
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="chats" replace />} />
            <Route path="chats" element={<ChatsPage />} />
            <Route path="chats/archived" element={<ArchivedChatsPage />} />
            <Route path="chats/:id" element={<ChatRoomPage />} />
            <Route path="calls" element={<CallsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Call screens */}
          <Route
            path="/incoming-call"
            element={
              <RequireAuth>
                <IncomingCallPage />
              </RequireAuth>
            }
          />
          <Route
            path="/video-call"
            element={
              <RequireAuth>
                <VideoCallPage />
              </RequireAuth>
            }
          />
          <Route
            path="/voice-call"
            element={
              <RequireAuth>
                <VoiceCallPage />
              </RequireAuth>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
