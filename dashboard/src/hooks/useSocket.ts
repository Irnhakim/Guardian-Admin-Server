"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3008";

let socketInstance: Socket | null = null;

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(socketInstance);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(`${WS_URL}/guardian`, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 5,
      });
    }

    setSocket(socketInstance);
  }, []);

  return socket;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
