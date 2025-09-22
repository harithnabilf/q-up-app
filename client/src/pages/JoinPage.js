import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueue } from '../hooks/useQueue';
import { useQueueData } from '../hooks/useQueueData';

const JoinPage = () => {
  const { queueId } = useParams();
  const navigate = useNavigate();
  const { socket } = useQueue();
  const { queue, loading, error } = useQueueData(queueId);

  const unlockAudio = () => {
    const sound = new Audio('/silence.mp3');
    sound.play().catch(error => {
      // This catch is important to prevent errors on browsers that still block it.
      console.log("Audio unlock failed, but this is expected on some browsers.");
    });
  };

  const handleJoin = () => {
    // This is the crucial step: unlock audio on the very first user tap.
    unlockAudio();

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