import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { api } from '../utils/api';
import { SERVER_URL, AVATAR_URL, username } from '../utils/constants';

export default function LobbyScreen({ onJoin }) {
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    const uid = username + '-' + Date.now().toString();

    const socket = io(SERVER_URL, {
      query: {
        uid,
      },
    });

    socket.on('connect', () => {
      console.log('Connected to socket:', uid);
      getCheck();
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket:', uid);
      getCheck();
    });

    socket.on('user:logout', () => {
      getCheck();
    });

    socket.on('user:status', () => {
      getCheck();
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('user:logout');
      socket.off('user:status');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, []);

  const getCheck = async () => {
    try {
      const { data } = await api.get('/user/check');
      setUserList(data.users);
    } catch (err) {
      console.error('Failed to get user list', err);
      toast.error('Failed to get user list');
    }
  };

  if (userList.length > 0) {
    return (
      <div
        onClick={onJoin}
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

  return null;
}
