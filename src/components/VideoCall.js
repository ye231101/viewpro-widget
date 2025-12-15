import React, { useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Mic, MicOff, Send, X } from 'lucide-react';
import {
  LiveKitRoom,
  VideoTrack,
  useParticipants,
  useLocalParticipant,
  useTracks,
  RoomAudioRenderer,
  useRoomContext,
} from '@livekit/components-react';
import { Track, AudioPresets, DataPacket_Kind } from 'livekit-client';
import { api } from '../utils/api';
import { AVATAR_URL, LIVEKIT_URL, USERNAME } from '../utils/constants';

// Configuration
const ROOM_NAME = 'test-room';

// Custom hook for media controls
function useMediaControls() {
  const { localParticipant } = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = useCallback(async () => {
    if (localParticipant) {
      await localParticipant.setMicrophoneEnabled(isMuted);
      setIsMuted(!isMuted);
    }
  }, [localParticipant, isMuted]);

  return {
    isMuted,
    toggleMute,
  };
}

// Participant Tile Component
function ParticipantTile({ participant }) {
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }], {
    onlySubscribed: false,
  }).filter((t) => t.participant.identity === participant.identity);

  const videoTrack = tracks.find((t) => t.source === Track.Source.Camera && t.publication?.track);
  const isSpeaking = participant.isSpeaking;
  const isMuted = !participant.isMicrophoneEnabled;

  return (
    <div
      className={`
        vp-relative vp-overflow-hidden vp-rounded-lg vp-bg-gradient-to-br vp-from-slate-800 vp-to-slate-900 vp-transition-all vp-duration-300 vp-ease-out
        ${isSpeaking && 'vp-ring-2 vp-ring-emerald-400 vp-ring-offset-2 vp-ring-offset-slate-950'}
      `}
    >
      {/* Video Stream */}
      {videoTrack?.publication?.track ? (
        <VideoTrack trackRef={videoTrack} className="vp-w-full vp-h-full vp-object-cover" />
      ) : (
        <div className="vp-w-full vp-h-full vp-flex vp-items-center vp-justify-center vp-bg-gradient-to-br vp-from-slate-700 vp-to-slate-800">
          <div className="vp-w-20 vp-h-20 vp-rounded-full vp-bg-gradient-to-br vp-from-indigo-500 vp-to-purple-600 vp-flex vp-items-center vp-justify-center vp-text-white vp-text-2xl vp-font-semibold vp-shadow-xl">
            {participant.identity?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      )}

      {/* Participant Info */}
      <div className="vp-absolute vp-bottom-0 vp-left-0 vp-right-0 vp-p-2 vp-flex vp-items-center vp-justify-end">
        {isMuted && (
          <div className="vp-p-1.5 vp-bg-red-500/80 vp-backdrop-blur-sm vp-rounded-lg">
            <MicOff size={14} className="vp-text-white" />
          </div>
        )}
        {isSpeaking && !isMuted && (
          <div className="vp-p-1.5 vp-bg-emerald-500/80 vp-backdrop-blur-sm vp-rounded-lg vp-animate-pulse">
            <Mic size={14} className="vp-text-white" />
          </div>
        )}
      </div>
    </div>
  );
}

// Video Grid Component
function VideoGrid() {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  // Only show remote participants, exclude local participant
  const remoteParticipants = participants.filter((p) => p.identity !== localParticipant?.identity);

  const gridCols =
    remoteParticipants.length <= 2
      ? 'vp-grid-cols-1'
      : remoteParticipants.length <= 4
      ? 'vp-grid-cols-2'
      : remoteParticipants.length <= 6
      ? 'vp-grid-cols-3'
      : 'vp-grid-cols-4';

  // Show a waiting message if no remote participants
  if (remoteParticipants.length === 0) {
    return (
      <div className="vp-w-full vp-h-full vp-flex vp-items-center vp-justify-center vp-bg-black md:vp-rounded-lg md:vp-shadow-lg">
        <div className="vp-relative vp-w-16 vp-h-16 vp-rounded-full vp-object-cover">
          <div className="vp-absolute vp-inset-0 vp-animate-spin vp-rounded-full vp-border-4 vp-border-t-white vp-border-r-transparent vp-border-b-transparent vp-border-l-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`vp-w-full vp-h-full vp-grid ${gridCols} vp-auto-rows-fr md:vp-rounded-lg md:vp-shadow-lg`}
    >
      {remoteParticipants.map((participant) => (
        <ParticipantTile key={participant.identity} participant={participant} />
      ))}
    </div>
  );
}

// Control Bar Component
function ControlBar({ onLeave }) {
  const { isMuted, toggleMute } = useMediaControls();

  return (
    <div className="vp-absolute vp-top-4 vp-left-0 vp-right-0 vp-w-full vp-flex vp-flex-row vp-items-center vp-justify-between vp-gap-2 vp-px-4 vp-z-10">
      <div className="vp-w-full vp-flex vp-flex-row vp-items-center vp-gap-2">
        <img
          // src={AVATAR_URL + (agent?.avatar || 'default.jpg')}
          src={AVATAR_URL + 'default.jpg'}
          alt="avatar"
          crossOrigin="anonymous"
          className="vp-w-10 vp-h-10 vp-rounded-full"
        />
        <span className="vp-text-white vp-text-lg vp-font-bold">
          Agent
          {/* {agent?.username || 'Agent'} */}
        </span>
      </div>
      <div className="vp-flex vp-flex-row vp-items-center vp-gap-4">
        <div className="vp-text-white vp-text-base vp-font-bold vp-tracking-widest vp-bg-pink-500 vp-rounded-sm vp-px-2 vp-py-1">
          LIVE
        </div>
        <X size={30} className="vp-text-white vp-cursor-pointer" onClick={onLeave} />
        <div className="vp-absolute vp-top-20 vp-right-4 vp-z-10">
          {isMuted ? (
            <MicOff size={30} onClick={toggleMute} className="vp-text-white vp-cursor-pointer" />
          ) : (
            <Mic size={30} onClick={toggleMute} className="vp-text-white vp-cursor-pointer" />
          )}
        </div>
      </div>
    </div>
  );
}

function MessageInput({ message, setMessage, sendMessage }) {
  return (
    <div className="vp-absolute vp-bottom-10 vp-right-0 vp-w-full vp-flex vp-flex-row vp-items-center vp-justify-between vp-gap-2 vp-px-4">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
          }
        }}
        placeholder="Add a comment..."
        className="vp-w-full vp-px-4 vp-py-2 vp-rounded-full vp-border vp-outline-none vp-text-base vp-text-white vp-bg-transparent"
      />
      <Send size={24} onClick={sendMessage} className="vp-text-white vp-cursor-pointer" />
    </div>
  );
}

function MessagesContainer({ messages, messagesRef, offset }) {
  return (
    <div
      className="vp-absolute vp-left-[16px] vp-right-0 vp-z-10 vp-flex vp-flex-col vp-justify-end vp-w-[calc(100%-70px)]"
      style={{
        bottom: `${90 + offset}px`,
        height: `calc(100% - ${160 + offset}px)`,
      }}
    >
      <div className="vp-w-full vp-flex vp-flex-col vp-items-start vp-gap-2 vp-overflow-y-auto vp-break-words vp-scrollbar-none">
        {messages.map((msg, idx) => (
          <div key={idx} className="vp-w-full vp-flex vp-flex-row vp-gap-2">
            <img
              src={msg.username === USERNAME ? AVATAR_URL + 'default.jpg' : AVATAR_URL + msg.avatar}
              alt="avatar"
              crossOrigin="anonymous"
              className="vp-w-10 vp-h-10 vp-rounded-full"
            />
            <div className="vp-flex vp-flex-col">
              <span className="vp-text-white vp-text-sm vp-font-bold">{msg.username}</span>
              <span className="vp-inline-block vp-text-white vp-text-base vp-break-all">
                {msg.text}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesRef} />
      </div>
    </div>
  );
}

function RoomContainer({ onLeave }) {
  const room = useRoomContext();

  const [message, setMessage] = useState('');
  const [offset, setOffset] = useState(0);
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (navigator.virtualKeyboard) {
      navigator.virtualKeyboard.overlaysContent = true;

      const handleGeometryChange = (event) => {
        // Some browsers use event.target.boundingRect, others use event.targetRect
        const rect = event.targetRect || (event.target && event.target.boundingRect);
        if (rect) {
          const { x, y, width, height } = rect;
          console.log(x, y, width, height);

          if (height > 0) {
            setOffset(height);
          } else {
            setOffset(0);
          }
        }
      };

      navigator.virtualKeyboard.addEventListener('geometrychange', handleGeometryChange);

      return () => {
        navigator.virtualKeyboard.removeEventListener('geometrychange', handleGeometryChange);
      };
    } else if (window.visualViewport) {
      const handleResize = () => {
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);

        setOffset(window.innerHeight - window.visualViewport.height);
      };

      window.visualViewport.addEventListener('resize', handleResize);

      handleResize();

      return () => {
        window.visualViewport.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!room) return;

    const onDataReceived = (payload, participant, kind) => {
      try {
        const decoder = new TextDecoder();
        const text = decoder.decode(payload);
        const data = JSON.parse(text);

        if (data.type === 'chat') {
          setMessages((prev) => [
            ...prev,
            {
              username: data.username || 'Anonymous',
              avatar: data.avatar || 'default.jpg',
              text: data.text,
            },
          ]);
        }
      } catch (e) {
        console.error('Failed to parse chat message', e);
      }
    };

    room.on('dataReceived', onDataReceived);

    return () => {
      room.off('dataReceived', onDataReceived);
    };
  }, [room]);

  const scrollToBottom = () => {
    messagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = useCallback(async () => {
    if (!message.trim() || !room) return;

    const msgData = {
      type: 'chat',
      username: USERNAME,
      avatar: 'default.jpg',
      text: message.trim(),
    };

    const encoder = new TextEncoder();
    const payload = encoder.encode(JSON.stringify(msgData));

    try {
      await room.localParticipant.publishData(payload, DataPacket_Kind.RELIABLE);
      setMessages((prev) => [
        ...prev,
        {
          username: USERNAME,
          avatar: 'default.jpg',
          text: message.trim(),
        },
      ]);
      setMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
      toast.error('Failed to send message');
    }
  }, [message, room]);

  return (
    <>
      <RoomAudioRenderer />
      <VideoGrid />
      <ControlBar onLeave={onLeave} />
      <MessageInput message={message} setMessage={setMessage} sendMessage={sendMessage} />
      <MessagesContainer messages={messages} messagesRef={messagesRef} offset={offset} />
    </>
  );
}

// Video Room Component with enhanced audio settings
function RoomScreen({ token, onLeave }) {
  // Room options with enhanced audio settings for noise suppression and quality
  const roomOptions = {
    // Audio capture defaults with noise suppression
    audioCaptureDefaults: {
      // Enable noise suppression - removes background noise
      noiseSuppression: true,
      // Enable echo cancellation - prevents echo/feedback
      echoCancellation: true,
      // Enable auto gain control - normalizes volume levels
      autoGainControl: true,
      // High sample rate for better quality
      sampleRate: 48000,
      // Channel count (mono for voice is typically better)
      channelCount: 1,
    },
    // Video capture defaults
    videoCaptureDefaults: {
      resolution: {
        width: 1280,
        height: 720,
        frameRate: 30,
      },
    },
    // Adaptive streaming for better quality based on network
    adaptiveStream: true,
    // Dynacast for bandwidth optimization
    dynacast: true,
    // Publish defaults for outgoing tracks
    publishDefaults: {
      // Use speech preset optimized for voice clarity
      audioPreset: AudioPresets.speech,
      // Enable DTX (Discontinuous Transmission) - saves bandwidth during silence
      dtx: true,
      // Enable RED (Redundant Encoding) - better packet loss resilience
      red: true,
    },
  };

  return (
    <div className="vp-fixed vp-bottom-0 md:vp-bottom-5 vp-right-0 md:vp-right-5 vp-z-[9999] vp-w-full md:vp-w-[360px] vp-h-full md:vp-h-[812px] vp-flex vp-flex-col">
      <LiveKitRoom
        serverUrl={LIVEKIT_URL}
        token={token}
        connect={true}
        video={false}
        audio={false}
        options={roomOptions}
        className="vp-relative vp-w-full vp-h-full md:vp-h-[720px]"
      >
        <RoomContainer onLeave={onLeave} />
      </LiveKitRoom>

      <div className="vp-h-[92px] vp-hidden md:vp-flex vp-items-center vp-justify-center vp-self-end">
        <div
          onClick={onLeave}
          className="vp-w-16 vp-h-16 vp-flex vp-items-center vp-justify-center vp-bg-black vp-rounded-full vp-shadow-lg vp-cursor-pointer"
        >
          <X size={30} className="vp-text-white" />
        </div>
      </div>
    </div>
  );
}

// Lobby Screen Component
function LobbyScreen({ onJoin }) {
  return (
    <div
      onClick={() => onJoin(ROOM_NAME, USERNAME)}
      className="vp-fixed vp-bottom-5 vp-right-5 vp-z-[9999] vp-flex vp-items-center vp-justify-center vp-cursor-pointer"
    >
      <div className="vp-w-[92px] vp-h-[92px] vp-flex vp-items-center vp-justify-center vp-rounded-full vp-bg-gradient-to-tr vp-from-yellow-400 vp-via-pink-500 vp-to-purple-500">
        <div className="vp-w-[84px] vp-h-[84px] vp-flex vp-items-center vp-justify-center vp-rounded-full vp-bg-white">
          <div className="vp-relative vp-w-[76px] vp-h-[76px] vp-flex vp-items-center vp-justify-center vp-rounded-full vp-bg-gray-800">
            <div className="vp-wave" />
            <div className="vp-wave" />
            <div className="vp-wave" />
            <div className="vp-wave" />
            <img
              src={AVATAR_URL + 'volkmar.jpg'}
              alt="avatar"
              crossOrigin="anonymous"
              className="vp-w-[56px] vp-h-[56px] vp-rounded-full vp-avatar-pulse"
            />
          </div>
        </div>
        <span className="vp-absolute vp--bottom-1 vp-left-1/2 vp--translate-x-1/2 vp-rounded vp-border-2 vp-border-white vp-bg-pink-600 vp-px-2 vp-text-[10px] vp-leading-normal vp-font-bold vp-text-white">
          LIVE
        </span>
      </div>
    </div>
  );
}

// Main App Component
export default function VideoCall() {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async (room, user) => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/livekit/token', {
        params: { room: room, username: user },
      });
      setToken(data.token);
    } catch (err) {
      console.error('Failed to fetch token');
      toast.error('Failed to fetch token');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeave = () => {
    setIsLoading(false);
    setToken(null);
  };

  if (isLoading || token) {
    return <RoomScreen token={token} onLeave={handleLeave} />;
  }

  return <LobbyScreen onJoin={handleJoin} />;
}
