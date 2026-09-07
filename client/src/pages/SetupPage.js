import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

const SetupPage = () => {
  const [queueName, setQueueName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Ping backend immediately on page load to wake up Render free instance if idle
  useEffect(() => {
    axios.get(`${SERVER_URL}/api/queues/vapidPublicKey`).catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (queueName.trim() && !isLoading) {
      setIsLoading(true);
      setError('');
      try {
        const response = await axios.post(`${SERVER_URL}/api/queues`, {
          name: queueName.trim(),
        });
        const newQueue = response.data;
        navigate(`/${newQueue._id}/confirmation`);
      } catch (err) {
        setError('Could not create queue. Please try again.');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="content-wrapper">
      <img src="/logo.png" alt="Q-Up Logo" className="logo-image" />
      <h1>Create Queue</h1>
      <p className="setup-description">
        Enter a name for your queue that will be visible to those joining.
      </p>
      <input
        type="text"
        className="input-field"
        placeholder="Queue name"
        value={queueName}
        onChange={(e) => setQueueName(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
        disabled={isLoading}
      />
      <button
        className="btn btn-primary"
        onClick={handleCreate}
        disabled={!queueName.trim() || isLoading}
      >
        {isLoading ? 'Creating Queue...' : 'Create'}
      </button>

      {isLoading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-title">Waking up server...</p>
          <p className="loading-subtext">
            Render's free tier spins down when inactive. This may take 1–2 minutes on first load.
          </p>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!isLoading && (
        <div className="server-notice">
          <span className="server-notice-icon">ℹ️</span>
          <div>
            <strong>Notice:</strong> Hosted on Render free tier. If inactive, the server takes 1–2 minutes to spin up on first request.
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupPage;