import { useState } from 'react';
import { toast } from 'react-hot-toast';
import LobbyScreen from './LobbyScreen';
import RoomScreen from './RoomScreen';
import { api } from '../utils/api';
import { username } from '../utils/constants';

export default function VideoCall() {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState(null);

  const handleJoin = async () => {
    const room = 'viewpro-room-' + Date.now().toString();

    try {
      setIsOpen(true);
      const { data } = await api.get('/livekit/token', {
        params: { room, username },
      });
      setToken(data.token);

      await api.post('/call/request', { callerName: username, roomName: room });
    } catch (err) {
      console.error('Failed to fetch token');
      toast.error('Failed to fetch token');
    }
  };

  const handleLeave = () => {
    setToken(null);
    setIsOpen(false);
  };

  if (isOpen) {
    return <RoomScreen token={token} onLeave={handleLeave} />;
  }

  return <LobbyScreen onJoin={handleJoin} />;
}