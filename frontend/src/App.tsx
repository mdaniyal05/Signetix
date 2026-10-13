import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/auth/AuthContext";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LandingPage } from "@/pages/LandingPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ChatsPage } from "@/pages/ChatsPage";
import { ContactsPage } from "@/pages/ContactsPage";
import { CallHistoryPage } from "@/pages/CallHistoryPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { SignupPage } from "@/pages/auth/SignupPage";
import { VerifyEmailPage } from "@/pages/auth/VerifyEmailPage";

// Heavy routes (VideoSDK call + camera recognition) are code-split.
const CallPage = lazy(() =>
  import("@/pages/CallPage").then((m) => ({ default: m.CallPage })),
);
const RecognitionTestPage = lazy(() =>
  import("@/pages/RecognitionTestPage").then((m) => ({
    default: m.RecognitionTestPage,
  })),
);

// Public landing for guests; signed-in users go straight to their dashboard.
function Home() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/recognition-test" element={<RecognitionTestPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/verify" element={<VerifyEmailPage />} />
          <Route path="/call/:meetingId" element={<CallPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chats" element={<ChatsPage />} />
            <Route path="/chats/:chatId" element={<ChatsPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/history" element={<CallHistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
