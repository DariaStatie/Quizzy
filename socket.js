import { io } from 'socket.io-client';

const socket = io('https://quizzy-realtime-server-production-0b1a.up.railway.app', {
  transports: ['websocket'],
});

export default socket;
