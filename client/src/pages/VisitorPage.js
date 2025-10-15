import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueueData } from '../hooks/useQueueData';

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const VisitorPage = () => {
  const { queueId, ticketNumber } = useParams();
  const { queue, loading, error } = useQueueData(queueId);
  const [timeLeft, setTimeLeft] = useState(0);
  
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

      if (!isReady && queue.estimatedTimePerTicket > 0) {
        const myIndex = queue.waiting.findIndex(t => t.ticketNumber === myTicket);
        if (myIndex > -1) {
          let waitMinutes = 0;
          for(let i = 0; i <= myIndex; i++) {
              waitMinutes += queue.estimatedTimePerTicket + queue.waiting[i].timeAdjustment;
          }
          setTimeLeft(Math.max(0, waitMinutes * 60));
        }
      }
    }
  }, [queue, myTicket]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const intervalId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft]);

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

  const formatTime = (seconds) => {
    if (seconds <= 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
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
          {timeLeft > 0 && (
            <div className="visitor-time-container">
              <span className="visitor-time-label">Waiting time is</span>
              <span className="visitor-time-estimate">≈{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="content-wrapper">
      <div className="visitor-header">
        <LocationIcon />
        <span className="visitor-header-name">{queue.name}</span>
      </div>
      {renderContent()}
    </div>
  );
};

export default VisitorPage;