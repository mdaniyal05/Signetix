import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { Phone, PhoneOff, Video } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/auth/AuthContext";
import { useSocket } from "@/realtime/SocketContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { hasVideoSdkToken } from "@/config/env";
import { createMeeting } from "@/lib/videosdk";

interface IncomingCall {
  meetingId: string;
  senderPhoneNumber: string;
  targetPhoneNumbers: string[];
  isVoiceCall: boolean;
  callinitiator: string;
}

interface CallSignalingValue {
  startCall: (
    targetPhoneNumbers: string[],
    isVoiceCall?: boolean,
  ) => Promise<void>;
}

const CallSignalingContext = createContext<CallSignalingValue>({
  startCall: async () => undefined,
});

/**
 * Handles call ring signaling over Socket.io: places outgoing calls
 * (`meeting-id`) and surfaces incoming offers (`meeting-id-offer`) as a dialog
 * the user can accept or decline. Must be inside the router + socket + auth.
 */
export function CallSignalingProvider({ children }: { children: ReactNode }) {
  const { socket } = useSocket();
  const { session } = useAuth();
  const navigate = useNavigate();
  const myPhone = session?.phoneNumber;
  const [incoming, setIncoming] = useState<IncomingCall | null>(null);

  useEffect(() => {
    if (!socket) return;

    const onOffer = (data: IncomingCall) => setIncoming(data);
    const onDeclined = () => {
      toast.info("Call declined");
    };
    const onFailed = (data: { message?: string }) => {
      toast.error("Could not reach the other participant", {
        description: data?.message,
      });
    };

    socket.on("meeting-id-offer", onOffer);
    socket.on("call-declined", onDeclined);
    socket.on("meeting-id-failed", onFailed);
    return () => {
      socket.off("meeting-id-offer", onOffer);
      socket.off("call-declined", onDeclined);
      socket.off("meeting-id-failed", onFailed);
    };
  }, [socket]);

  const startCall = useCallback(
    async (targetPhoneNumbers: string[], isVoiceCall = false) => {
      if (!socket || !myPhone) {
        toast.error("Not connected. Try again in a moment.");
        return;
      }
      if (!hasVideoSdkToken()) {
        toast.error("Set VITE_VIDEOSDK_TOKEN to place calls.");
        return;
      }
      try {
        const meetingId = await createMeeting();
        socket.emit("meeting-id", {
          userPhoneNumber: myPhone,
          targetPhoneNumbers,
          meetingId,
          isVoiceCall,
          isOnCall: true,
          callinitiator: myPhone,
        });
        navigate(`/call/${meetingId}`);
      } catch (error) {
        toast.error("Could not start the call", {
          description: error instanceof Error ? error.message : undefined,
        });
      }
    },
    [socket, myPhone, navigate],
  );

  const acceptCall = useCallback(() => {
    if (!incoming || !socket || !myPhone) return;
    socket.emit("meeting-accepted", {
      userPhoneNumber: myPhone,
      targetPhoneNumbers: incoming.targetPhoneNumbers,
      meetingId: incoming.meetingId,
      isVoiceCall: incoming.isVoiceCall,
      isOnCall: true,
      callinitiator: incoming.callinitiator,
    });
    const meetingId = incoming.meetingId;
    setIncoming(null);
    navigate(`/call/${meetingId}`);
  }, [incoming, socket, myPhone, navigate]);

  const declineCall = useCallback(() => {
    if (!incoming || !socket || !myPhone) return;
    socket.emit("meeting-id-decline", {
      userPhoneNumber: myPhone,
      targetPhoneNumbers: incoming.targetPhoneNumbers,
      meetingId: incoming.meetingId,
      isVoiceCall: incoming.isVoiceCall,
      isOnCall: false,
      callinitiator: incoming.callinitiator,
    });
    setIncoming(null);
  }, [incoming, socket, myPhone]);

  const value = useMemo<CallSignalingValue>(() => ({ startCall }), [startCall]);

  return (
    <CallSignalingContext.Provider value={value}>
      {children}
      <Dialog
        open={incoming !== null}
        onOpenChange={(open) => !open && declineCall()}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {incoming?.isVoiceCall ? (
                <Phone className="size-5" />
              ) : (
                <Video className="size-5" />
              )}
              Incoming {incoming?.isVoiceCall ? "voice" : "video"} call
            </DialogTitle>
            <DialogDescription>
              {incoming?.senderPhoneNumber} is calling you.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button variant="destructive" onClick={declineCall}>
              <PhoneOff />
              Decline
            </Button>
            <Button onClick={acceptCall}>
              <Phone />
              Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CallSignalingContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCallSignaling(): CallSignalingValue {
  return useContext(CallSignalingContext);
}
