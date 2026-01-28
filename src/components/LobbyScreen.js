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
      <div onClick={onJoin} className="vp-floating-button">
        <div className="vp-floating-button-gradient">
          <div className="vp-floating-button-white">
            <div className="vp-floating-button-avatar-container">
              <div className="vp-wave" />
              <div className="vp-wave" />
              <div className="vp-wave" />
              <div className="vp-wave" />
              <img
                src={AVATAR_URL + 'volkmar.jpg'}
                alt="avatar"
                crossOrigin="anonymous"
                className="vp-floating-button-avatar"
              />
            </div>
          </div>
          <span className="vp-floating-button-live">LIVE</span>
        </div>
      </div>
    );
  }

  return null;
}
