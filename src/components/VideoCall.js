import LobbyScreen from './LobbyScreen';

export default function VideoCall() {
  const handleJoin = async () => {
    console.log('handleJoin');
  };

  return <LobbyScreen onJoin={handleJoin} />;
}