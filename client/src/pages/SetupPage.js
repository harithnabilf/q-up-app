import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

const SetupPage = () => {
  const [queueName, setQueueName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (queueName.trim()) {
      try {
        const response = await axios.post(`${SERVER_URL}/api/queues`, {
          name: queueName.trim(),
        });
        const newQueue = response.data;
        navigate(`/${newQueue._id}/confirmation`);
      } catch (err) {
        setError('Could not create queue. Please try again.');
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
      />
      <button className="btn btn-primary" onClick={handleCreate} disabled={!queueName.trim()}>
        Create
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default SetupPage;