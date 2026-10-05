import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Hand,
  Loader2,
  MessageSquare,
  PhoneCall,
  Users,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { hasVideoSdkToken } from "@/config/env";
import { createMeeting } from "@/lib/videosdk";

export function DashboardPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState("");
  const [creating, setCreating] = useState(false);
  const tokenPresent = hasVideoSdkToken();

  const startCall = async () => {
    setCreating(true);
    try {
      const roomId = await createMeeting();
      navigate(`/call/${roomId}`);
    } catch (error) {
      toast.error("Could not start the call", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setCreating(false);
    }
  };

  const shortcuts = [
    {
      to: "/chats",
      label: "Chats",
      description: "Message your contacts",
      icon: MessageSquare,
    },
    {
      to: "/contacts",
      label: "Contacts",
      description: "Manage your contacts",
      icon: Users,
    },
    {
      to: "/history",
      label: "Call history",
      description: "Review past calls",
      icon: PhoneCall,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome back, {session?.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-muted-foreground">
          Start a video call with real-time PSL recognition, or jump into a
          chat.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="size-5" />
            Video call
          </CardTitle>
          <CardDescription>
            Create a new meeting or join one with an ID.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!tokenPresent && (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              Set <code className="font-mono">VITE_VIDEOSDK_TOKEN</code> in{" "}
              <code className="font-mono">.env.local</code> to start calls.
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={startCall} disabled={!tokenPresent || creating}>
              {creating ? <Loader2 className="animate-spin" /> : <Video />}
              New meeting
            </Button>
            <div className="flex flex-1 gap-2">
              <Input
                placeholder="Enter meeting ID"
                value={meetingId}
                onChange={(event) => setMeetingId(event.target.value)}
              />
              <Button
                variant="secondary"
                disabled={!tokenPresent || !meetingId.trim()}
                onClick={() => navigate(`/call/${meetingId.trim()}`)}
              >
                Join
              </Button>
            </div>
          </div>
          <Button variant="ghost" onClick={() => navigate("/recognition-test")}>
            <Hand />
            Test PSL recognition (no call)
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {shortcuts.map(({ to, label, description, icon: Icon }) => (
          <Card
            key={to}
            role="button"
            tabIndex={0}
            onClick={() => navigate(to)}
            onKeyDown={(event) => event.key === "Enter" && navigate(to)}
            className="cursor-pointer transition-colors hover:bg-accent"
          >
            <CardHeader>
              <Icon className="size-6 text-muted-foreground" />
              <CardTitle className="text-base">{label}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
