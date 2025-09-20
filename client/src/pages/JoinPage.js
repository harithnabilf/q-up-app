import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueue } from '../hooks/useQueue';
import { useQueueData } from '../hooks/useQueueData';

const JoinPage = () => {
  const { queueId } = useParams();
  const navigate = useNavigate();
  const { socket } = useQueue();
  const { queue, loading, error } = useQueueData(queueId);

  const handleJoin = () => {
    if (socket && queueId) {
      socket.emit('join-queue', { queueId }, (response) => {
        if (response.ticketNumber) {
          navigate(`/queue/${queueId}/ticket/${response.ticketNumber}`);
        } else {
          console.error(response.error);
        }
      });
    }
  };

  if (loading) return <div className="content-wrapper"><h1>Loading...</h1></div>;
  if (error) return <div className="content-wrapper"><h1>Queue not found.</h1></div>;

  return (
    <div className="content-wrapper">
      <h2>You are joining the '{queue?.name}' queue.</h2>
      <button className="btn btn-primary" onClick={handleJoin}>
        Join
      </button>
    </div>
  );
};

export default JoinPage;