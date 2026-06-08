"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";

let socketInstance: Socket | null = null;

export function useSocket() {
  const { accessToken, isAuthenticated } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(socketInstance);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
      setSocket(null);
      return;
    }

    if (!socketInstance) {
      socketInstance = io(`${WS_URL}/guardian`, {
        auth: { token: accessToken },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 5,
      });
    }

    setSocket(socketInstance);
  }, [isAuthenticated, accessToken]);

  return socket;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
