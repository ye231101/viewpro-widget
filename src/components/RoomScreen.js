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

  return (
    <div className="vp-participant-tile">
      {videoTrack?.publication?.track && (
        <VideoTrack trackRef={videoTrack} className="vp-participant-tile-video" />
      )}
    </div>
  );
}

function VideoGrid() {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  const remoteParticipants = participants.filter((p) => p.identity !== localParticipant?.identity);

  const gridCols =
    remoteParticipants.length <= 2
      ? 'vp-video-grid-cols-1'
      : remoteParticipants.length <= 4
        ? 'vp-video-grid-cols-2'
        : remoteParticipants.length <= 6
          ? 'vp-video-grid-cols-3'
          : 'vp-video-grid-cols-4';

  if (remoteParticipants.length === 0) {
    return (
      <div className="vp-loading">
        <div className="vp-loading-container">
          <div className="vp-loading-icon" />
        </div>
      </div>
    );
  }

  return (
    <div className={`vp-video-grid ${gridCols}`}>
      {remoteParticipants.map((participant) => (
        <ParticipantTile key={participant.identity} participant={participant} />
      ))}
    </div>
  );
}

function ControlBar({ onLeave }) {
  const { isMuted, toggleMute } = useMediaControls();

  return (
    <div className="vp-control-bar">
      <div className="vp-control-bar-info">
        <img
          src={AVATAR_URL + 'default.jpg'}
          alt="avatar"
          crossOrigin="anonymous"
          className="vp-control-bar-avatar"
        />
        <span className="vp-control-bar-name">Agent</span>
      </div>
      <div className="vp-control-bar-live">LIVE</div>
      <div className="vp-control-bar-close-button">
        <X size={30} className="vp-control-bar-button" onClick={onLeave} />
      </div>
      <div className="vp-control-bar-audio-button">
        {isMuted ? (
          <MicOff size={30} onClick={toggleMute} className="vp-control-bar-button" />
        ) : (
          <Mic size={30} onClick={toggleMute} className="vp-control-bar-button" />
        )}
      </div>
    </div>
  );
}

function MessageInput({ message, setMessage, sendMessage }) {
  return (
    <div className="vp-message-input-container">
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
        className="vp-message-input"
      />
      <Send size={24} onClick={sendMessage} className="vp-message-send-button" />
    </div>
  );
}

function MessagesContainer({ messages, messagesRef, offset }) {
  return (
    <div
      className="vp-messages-container"
      style={{
        width: `calc(100% - 70px)`,
        height: `calc(100% - ${160 + offset}px)`,
        bottom: `${90 + offset}px`,
      }}
    >
      <div className="vp-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className="vp-message-container">
            <img
              src={msg.username === username ? AVATAR_URL + 'default.jpg' : AVATAR_URL + msg.avatar}
              alt="avatar"
              crossOrigin="anonymous"
              className="vp-message-avatar"
            />
            <div className="vp-message">
              <span className="vp-message-name">{msg.username}</span>
              <span className="vp-message-text">{msg.text}</span>
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
    <div className="vp-room-container">
      <LiveKitRoom
        serverUrl={LIVEKIT_URL}
        token={token}
        connect={true}
        video={false}
        audio={false}
        options={roomOptions}
        className="vp-room"
      >
        <RoomContainer onLeave={onLeave} />
      </LiveKitRoom>

      <div className="vp-room-close-button-container">
        <div onClick={onLeave} className="vp-room-close-button">
          <X size={30} className="vp-room-close-button-icon" />
        </div>
      </div>
    </div>
  );
}
