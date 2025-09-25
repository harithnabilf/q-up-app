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

  if (loading) return <div className="content-wrapper"><h1>Loading...</h1></div>;
  if (error) return <div className="content-wrapper"><h1>Queue not found.</h1></div>;

  return (
    <div className="content-wrapper">
      <h2>You are joining the '{queue?.name}' queue.</h2>
      <button className="btn btn-primary" onClick={handleJoin} disabled={isSubscribing}>
        {isSubscribing ? 'Joining...' : 'Join'}
      </button>
      <p style={{fontSize: '0.8rem', color: '#666', marginTop: '1rem'}}>
        You may be asked for permission to show notifications. Please accept to be notified when it's your turn.
      </p>
    </div>
  );
};

export default JoinPage;