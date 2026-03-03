/* eslint-disable react-hooks/refs */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ HOOK : use-socket.ts
 * -------------------------------------------------------------------------
 * RÔLE : Gestion de la persistance de la liaison avec le Kernel.
 * RÉVISION : 03 Mars 2026 | 23:55 GMT
 */

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

export const useSocket = (namespace: string) => {
  const socketRef = useRef<Socket | null>(null);
  const { token } = useAuthStore() as any;

  useEffect(() => {
    if (!token) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000';

    socketRef.current = io(`${API_URL}/${namespace}`, {
      auth: { token },
      transports: ['websocket'],
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token, namespace]);

  return socketRef.current;
};