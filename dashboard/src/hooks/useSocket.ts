"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";

let socketInstance: Socket | null = null;

export function useSocket() {
  const { accessToken, isAuthenticated } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    if (!socketInstance) {
      socketInstance = io(`${WS_URL}/guardian`, {
        auth: { token: accessToken },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 5,
      });
    }

    socketRef.current = socketInstance;

    return () => {
      // Don't disconnect on unmount — keep the connection alive
    };
  }, [isAuthenticated, accessToken]);

  return socketRef.current;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
