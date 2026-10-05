import { useNavigate, useParams } from "react-router-dom";
import { MeetingProvider } from "@videosdk.live/react-sdk";

import { useAuth } from "@/auth/AuthContext";
import { CallView } from "@/components/call/CallView";
import { VIDEOSDK_TOKEN, hasVideoSdkToken } from "@/config/env";

export function CallPage() {
  const { meetingId = "" } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();

  if (!hasVideoSdkToken() || !meetingId) {
    navigate("/", { replace: true });
    return null;
  }

  return (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: session?.name ?? "Guest",
        debugMode: false,
      }}
      token={VIDEOSDK_TOKEN}
    >
      <CallView meetingId={meetingId} onLeave={() => navigate("/")} />
    </MeetingProvider>
  );
}
