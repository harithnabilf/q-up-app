import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQueueData } from '../hooks/useQueueData';

const VisitorPage = () => {
  const { queueId, ticketNumber } = useParams();
  const { queue, loading, error } = useQueueData(queueId);
  
  const myTicket = parseInt(ticketNumber);
  const audioRef = useRef(null);
  const hasBeenCalledRef = useRef(false);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/notification.mp3');
    }

    if (queue) {
      const isReady = queue.currentlyServing === myTicket;
      
      if (isReady && !hasBeenCalledRef.current) {
        audioRef.current.play().catch(e => console.log("Audio play failed.", e));
        hasBeenCalledRef.current = true;
      }
    }
  }, [queue, myTicket]);

  if (loading) return <div className="content-wrapper"><h1>Finding your spot in the queue...</h1></div>;
  if (error) return <div className="content-wrapper"><h1>Queue not found.</h1></div>;

  const isReady = queue.currentlyServing === myTicket;
  const position = queue.waiting.findIndex(t => t.ticketNumber === myTicket) + 1;

  const formatTicket = (num) => `#${String(num).padStart(3, '0')}`;
  
  const getPositionText = (pos) => {
    if (pos === 1) return "You are 1st in the queue";
    if (pos === 2) return "You are 2nd in the queue";
    if (pos === 3) return "You are 3rd in the queue";
    return `You are ${pos}th in the queue`;
  };

  const renderContent = () => {
    if (isReady) {
      return (
        <div className="visitor-circle status-ready">
          <div className="visitor-circle-halo"></div>
          <span className="visitor-ticket-number">{formatTicket(myTicket)}</span>
          <h1 className="visitor-status-heading">It is your turn now!</h1>
        </div>
      );
    }
    
    if (position > 0) {
      return (
        <div className="visitor-circle status-waiting">
          <div className="visitor-circle-halo"></div>
          <span className="visitor-ticket-number">{formatTicket(myTicket)}</span>
          <h1 className="visitor-status-heading">{getPositionText(position)}</h1>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="content-wrapper">
      {renderContent()}
    </div>
  );
};

export default VisitorPage;