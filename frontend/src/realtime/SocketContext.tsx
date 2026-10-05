import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";

import { useAuth } from "@/auth/AuthContext";
import { SOCKET_URL } from "@/config/env";

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
});

/**
 * Maintains one Socket.io connection for the signed-in user and registers their
 * phone number (`socket-registration`) so the backend can route chat messages
 * and call signaling to them.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const phoneNumber = session?.phoneNumber;
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!phoneNumber) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
      return;
    }

    const instance = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });
    socketRef.current = instance;
    setSocket(instance);

    const register = () => {
      instance.emit("socket-registration", { userPhoneNumber: phoneNumber });
      setConnected(true);
    };
    instance.on("connect", register);
    instance.on("disconnect", () => setConnected(false));

    return () => {
      instance.off("connect", register);
      instance.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, [phoneNumber]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSocket(): SocketContextValue {
  return useContext(SocketContext);
}
