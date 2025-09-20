import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQueueData } from '../hooks/useQueueData';

const VisitorPage = () => {
  const { queueId, ticketNumber } = useParams();
  const { queue, loading, error } = useQueueData(queueId);
  const isReadyRef = useRef(false);
  
  const myTicket = parseInt(ticketNumber);

  useEffect(() => {
    if (queue) {
        const isReady = queue.currentlyServing === myTicket;
        if (!isReadyRef.current && isReady) {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(error => {
                console.log("Audio playback failed:", error);
            });
        }
        isReadyRef.current = isReady;
    }
  }, [queue, myTicket]);

  if (loading) return <div className="content-wrapper"><h1>Finding your spot in the queue...</h1></div>;
  if (error) return <div className="content-wrapper"><h1>Queue not found.</h1></div>;

  const isReady = queue.currentlyServing === myTicket;
  const position = queue.waiting.indexOf(myTicket) + 1;

  const formatTicket = (num) => `#${String(num).padStart(3, '0')}`;
  
  const getPositionText = (pos) => {
    if (pos === 1) return "You are 1st in the queue";
    if (pos === 2) return "You are 2nd in the queue";
    if (pos === 3) return "You are 3rd in the queue";
    return `You are ${pos}th in the queue`;
  };

  if (isReady) {
    return (
      <div className="content-wrapper">
        <div className="visitor-circle status-ready">
          <div className="visitor-circle-halo"></div>
          <span className="visitor-ticket-number">{formatTicket(myTicket)}</span>
          <h1 className="visitor-status-heading">It is your turn now!</h1>
        </div>
      </div>
    );
  }
  
  if (position > 0) {
    return (
      <div className="content-wrapper">
        <div className="visitor-circle status-waiting">
          <div className="visitor-circle-halo"></div>
          <span className="visitor-ticket-number">{formatTicket(myTicket)}</span>
          <h1 className="visitor-status-heading">{getPositionText(position)}</h1>
        </div>
      </div>
    );
  }

  return null;
};

export default VisitorPage;