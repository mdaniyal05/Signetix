import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useSocket } from "@/realtime/SocketContext";

interface PresenceContextValue {
  isOnline: (phoneNumber?: string) => boolean;
}

const PresenceContext = createContext<PresenceContextValue>({
  isOnline: () => false,
});

/** Tracks which users are currently connected, via the backend presence events. */
export function PresenceProvider({ children }: { children: ReactNode }) {
  const { socket } = useSocket();
  const [online, setOnline] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!socket) return;

    const onState = (data: { online?: string[] }) =>
      setOnline(new Set(data?.online ?? []));

    const onUpdate = (data: { phoneNumber?: string; online?: boolean }) => {
      if (!data?.phoneNumber) return;
      setOnline((prev) => {
        const next = new Set(prev);
        if (data.online) next.add(data.phoneNumber!);
        else next.delete(data.phoneNumber!);
        return next;
      });
    };

    socket.on("presence-state", onState);
    socket.on("presence-update", onUpdate);
    socket.emit("presence-request"); // get the current list on mount

    return () => {
      socket.off("presence-state", onState);
      socket.off("presence-update", onUpdate);
    };
  }, [socket]);

  return (
    <PresenceContext.Provider
      value={{ isOnline: (phoneNumber) => !!phoneNumber && online.has(phoneNumber) }}
    >
      {children}
    </PresenceContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePresence(): PresenceContextValue {
  return useContext(PresenceContext);
}
