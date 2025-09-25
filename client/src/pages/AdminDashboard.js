import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQueue } from '../hooks/useQueue';
import { useQueueData } from '../hooks/useQueueData';

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
);

const AdminDashboard = () => {
  const { queueId } = useParams();
  const { socket } = useQueue();
  const { queue, loading, error } = useQueueData(queueId);
  
  // CORRECTED LINE:
  const [modalTicket, setModalTicket] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [nextTicketInput, setNextTicketInput] = useState('');

  useEffect(() => {
    if (queue) {
      setNextTicketInput(queue.nextTicket);
    }
  }, [queue]);

  if (loading) return <div className="content-wrapper"><h1>Loading Queue...</h1></div>;
  if (error) return <div className="content-wrapper"><h1>Queue not found.</h1></div>;

  const formatTicket = (num) => String(num).padStart(3, '0');
  const nextSequential = queue.waiting.length > 0 ? queue.waiting[0].ticketNumber : null;

  const handleCall = () => {
    socket.emit('call-specific', { queueId, ticketNumber: modalTicket });
    setModalTicket(null);
  };

  const handleRemove = () => {
    socket.emit('remove-from-queue', { queueId, ticketNumber: modalTicket });
    setModalTicket(null);
  };

  const handleSettingsSave = () => {
    const newStartNumber = parseInt(nextTicketInput);
    if (!isNaN(newStartNumber) && newStartNumber > 0) {
      socket.emit('update-next-ticket', { queueId, newStartNumber });
      setShowSettingsModal(false);
    }
  };

  const handleCallNext = () => {
    socket.emit('call-next', { queueId });
  };

  return (
    <>
      {modalTicket && (
        <div className="modal-overlay" onClick={() => setModalTicket(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setModalTicket(null)}>&times;</button>
            <h2 className="modal-ticket-number">#{formatTicket(modalTicket)}</h2>
            <div className="modal-btn-group">
              <button className="btn btn-primary" onClick={handleCall}>Call</button>
              <button className="btn btn-secondary" onClick={handleRemove}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={() => setShowSettingsModal(false)}>&times;</button>
                <h2>Settings</h2>
                <div className="form-group">
                    <label htmlFor="next-ticket-input">Set Next Ticket Number</label>
                    <p className="form-group-description">
                        This will be the number assigned to the next customer who joins the queue.
                    </p>
                    <input 
                        id="next-ticket-input"
                        type="number"
                        className="input-field"
                        value={nextTicketInput}
                        onChange={(e) => setNextTicketInput(e.target.value)}
                        min="1"
                    />
                </div>
                <div className="modal-btn-group">
                    <button className="btn btn-primary" onClick={handleSettingsSave}>Save</button>
                </div>
            </div>
        </div>
      )}

      <div className="admin-dashboard content-wrapper">
        <div className="header-with-settings">
            <h2>"{queue.name}"</h2>
            <button className="btn-icon-link" onClick={() => setShowSettingsModal(true)} aria-label="Open Settings">
                <SettingsIcon />
            </button>
        </div>
        
        <div className="admin-section">
          <h2>Currently Serving</h2>
          <div className="display-box">
              <div className="currently-serving-display">
                  {queue.currentlyServing ? formatTicket(queue.currentlyServing) : '---'}
              </div>
          </div>
        </div>
        
        <div className="admin-section">
          <h2>Waiting List</h2>
          {queue.waiting.length > 0 ? (
            <div className="waiting-list-grid">
              {queue.waiting.map(ticket => (
                <button key={ticket.ticketNumber} className="grid-btn" onClick={() => setModalTicket(ticket.ticketNumber)}>
                  {formatTicket(ticket.ticketNumber)}
                </button>
              ))}
            </div>
          ) : (
            <p>The queue is empty.</p>
          )}
        </div>

        <div className="admin-section">
          <button 
              className="btn btn-primary" 
              disabled={!nextSequential}
              onClick={handleCallNext}
          >
            {nextSequential ? `Call Next (#${formatTicket(nextSequential)})` : 'Call Next'}
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;