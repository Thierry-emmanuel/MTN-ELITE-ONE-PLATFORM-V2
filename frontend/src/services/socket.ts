import { io, Socket } from 'socket.io-client';

// Single shared connection for the whole app. If a socket client already
// exists elsewhere (e.g. wired up for the public VotingPanel), delete this
// file and point useAwardLiveVotes.ts at that one instead — don't run two
// connections to the same gateway.
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const base = (import.meta as any).env?.VITE_API_URL?.replace(/\/api(\/v\d+)?\/?$/, '') || 'http://localhost:3000';
    socket = io(base, { transports: ['websocket'], autoConnect: true });
  }
  return socket;
}
