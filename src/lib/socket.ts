import { io, Socket } from 'socket.io-client';
import type { SocketEvents } from '@/types';

class SocketManager {
  private socket: Socket | null = null;
  private static instance: SocketManager;

  private constructor() {}

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  connect(serverPath = 'http://localhost:3001'): Socket {
    if (!this.socket) {
      this.socket = io(serverPath, {
        transports: ['websocket', 'polling'],
      });
    }
    return this.socket;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit<K extends keyof SocketEvents>(
  event: K,
  ...args: SocketEvents[K] extends undefined ? [] : [SocketEvents[K]]
): void {
  if (this.socket) {
    this.socket.emit(event, ...args);
  }
}


  on<K extends keyof SocketEvents>(
  event: K,
  callback: (...args: SocketEvents[K] extends any[] ? SocketEvents[K] : [SocketEvents[K]]) => void
): void {
  if (this.socket) {
    this.socket.on(event as string, callback as (...args: any[]) => void);

  }
}


  off<K extends keyof SocketEvents>(event: K): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export const socketManager = SocketManager.getInstance();
