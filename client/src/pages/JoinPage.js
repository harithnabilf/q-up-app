import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueue } from '../hooks/useQueue';
import { useQueueData } from '../hooks/useQueueData';
import { subscribeUserToPush } from '../utils/push-helpers';

const JoinPage = () => {
  const { queueId } = useParams();
  const navigate = useNavigate();
  const { socket } = useQueue();
  const { queue, loading, error } = useQueueData(queueId);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleJoin = async () => {
    setIsSubscribing(true);
    const subscription = await subscribeUserToPush();
    
    if (socket && queueId) {
      socket.emit('join-queue', { queueId, subscription }, (response) => {
        if (response.ticketNumber) {
          navigate(`/queue/${queueId}/ticket/${response.ticketNumber}`);
        } else {
          console.error(response.error);
          setIsSubscribing(false);
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="content-wrapper">
        <div className="loading-container" style={{ marginTop: '2rem' }}>
          <div className="spinner"></div>
          <p className="loading-title">Connecting to queue...</p>
          <p className="loading-subtext">
            If the server was idle, Render's free tier may take 1–2 minutes to wake up.
          </p>
        </div>
      </div>
    );
  }
  if (error) return <div className="content-wrapper"><h1>Queue not found.</h1></div>;

  return (
    <div className="content-wrapper">
      <h2>You are joining the '{queue?.name}' queue.</h2>
      <button className="btn btn-primary" onClick={handleJoin} disabled={isSubscribing}>
        {isSubscribing ? 'Joining...' : 'Join'}
      </button>
      {/* UPDATED: The text has been changed below */}
      <p style={{fontSize: '0.8rem', color: '#666', marginTop: '1rem'}}>
        Please turn up your volume. A 'ding' sound will play when it's your turn!
      </p>
    </div>
  );
};

export default JoinPage;