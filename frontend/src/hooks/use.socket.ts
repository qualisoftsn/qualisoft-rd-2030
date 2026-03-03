/* eslint-disable react-hooks/refs */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : use-socket.ts
 * -------------------------------------------------------------------------
 * RÔLE : Liaison persistante avec le Kernel Socket.io.
 * RÉVISION : 03 Mars 2026 | 15:55 GMT
 */

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

export const useSocket = (namespace: string) => {
  const socketRef = useRef<Socket | null>(null);
  const { token } = useAuthStore() as any;

  useEffect(() => {
    // On ne tente la connexion que si le jeton souverain est présent
    if (!token) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000';

    // Initialisation du tunnel avec authentification par handshake
    socketRef.current = io(`${API_URL}/${namespace}`, {
      auth: { token },
      transports: ['websocket'], // Forçage WebSocket pour éviter le polling HTTP
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socketRef.current.on('connect_error', (err) => {
      console.error(`[SOCKET ERROR] ${namespace} :`, err.message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token, namespace]);

  return socketRef.current;
};