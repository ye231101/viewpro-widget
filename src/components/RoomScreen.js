import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
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
import { Mic, MicOff, X, Send } from 'lucide-react';
import { AVATAR_URL, LIVEKIT_URL, username } from '../utils/constants';

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

function ParticipantTile({ participant }) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    {
      onlySubscribed: false,
    },
  ).filter((t) => t.participant.identity === participant.identity);

  const screenShareTrack = tracks.find(
    (t) => t.source === Track.Source.ScreenShare && t.publication?.track,
  );
  const cameraTrack = tracks.find((t) => t.source === Track.Source.Camera && t.publication?.track);
  const videoTrack = screenShareTrack || cameraTrack;
  const isSpeaking = participant.isSpeaking;
  const isMuted = !participant.isMicrophoneEnabled;

  return (
    <div
      className={`
        vp-relative vp-overflow-hidden md:vp-rounded-lg vp-bg-gradient-to-br vp-from-slate-800 vp-to-slate-900 vp-transition-all vp-duration-300 vp-ease-out
        ${isSpeaking && 'vp-ring-2 vp-ring-emerald-400 vp-ring-offset-2 vp-ring-offset-slate-950'}
      `}
    >
      {videoTrack?.publication?.track ? (
        <VideoTrack trackRef={videoTrack} className="vp-w-full vp-h-full vp-object-cover" />
      ) : (
        <div className="vp-w-full vp-h-full vp-flex vp-items-center vp-justify-center vp-bg-gradient-to-br vp-from-slate-700 vp-to-slate-800">
          <div className="vp-w-20 vp-h-20 vp-rounded-full vp-bg-gradient-to-br vp-from-indigo-500 vp-to-purple-600 vp-flex vp-items-center vp-justify-center vp-text-white vp-text-2xl vp-font-semibold vp-shadow-xl">
            {participant.identity?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      )}

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

function VideoGrid() {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  const remoteParticipants = participants.filter((p) => p.identity !== localParticipant?.identity);

  const gridCols =
    remoteParticipants.length <= 2
      ? 'vp-grid-cols-1'
      : remoteParticipants.length <= 4
        ? 'vp-grid-cols-2'
        : remoteParticipants.length <= 6
          ? 'vp-grid-cols-3'
          : 'vp-grid-cols-4';

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

function ControlBar({ onLeave }) {
  const { isMuted, toggleMute } = useMediaControls();

  return (
    <div className="vp-absolute vp-top-4 vp-left-0 vp-right-0 vp-w-full vp-flex vp-flex-row vp-items-center vp-justify-between vp-gap-2 vp-px-4 vp-z-10">
      <div className="vp-w-full vp-flex vp-flex-row vp-items-center vp-gap-2">
        <img
          src={AVATAR_URL + 'default.jpg'}
          alt="avatar"
          crossOrigin="anonymous"
          className="vp-w-10 vp-h-10 vp-rounded-full"
        />
        <span className="vp-text-white vp-text-lg vp-font-bold">Agent</span>
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
              src={msg.username === username ? AVATAR_URL + 'default.jpg' : AVATAR_URL + msg.avatar}
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
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  const [offset, setOffset] = useState(0);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef(null);
  const hadRemoteParticipantRef = useRef(false);

  useEffect(() => {
    const remoteParticipants = participants.filter(
      (p) => p.identity !== localParticipant?.identity,
    );

    if (remoteParticipants.length > 0) {
      hadRemoteParticipantRef.current = true;
    }

    if (hadRemoteParticipantRef.current && remoteParticipants.length === 0) {
      onLeave();
    }
  }, [participants, localParticipant, onLeave]);

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
      username: username,
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
          username: username,
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

export default function RoomScreen({ token, onLeave }) {
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
