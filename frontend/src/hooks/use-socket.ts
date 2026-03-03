/* eslint-disable react-hooks/refs */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : use-socket.ts
 * -------------------------------------------------------------------------
 * RÔLE : Liaison bidirectionnelle avec le Kernel Socket.io.
 * RÉVISION : 03 Mars 2026 | 16:25 GMT
 * -------------------------------------------------------------------------
 */

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

export const useSocket = (namespace: string) => {
  const socketRef = useRef<Socket | null>(null);
  const { token } = useAuthStore() as any;

  useEffect(() => {
    // 🛡️ SENTINELLE : Pas de token, pas de tunnel.
    if (!token) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000';

    // Initialisation du tunnel souverain
    socketRef.current = io(`${API_URL}/${namespace}`, {
      auth: { token },
      transports: ['websocket'], // Forçage WebSocket pour la stabilité sur elite.qualisoft.sn
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current.on('connect_error', (err) => {
      console.error(`[MATRIX-SOCKET] Échec sur ${namespace}:`, err.message);
    });

    // Nettoyage lors du démontage du composant
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token, namespace]);

  return socketRef.current;
};