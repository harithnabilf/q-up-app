import { useState, useEffect } from 'react';
import { useQueue } from './useQueue'; // CORRECTED: Import from the correct hook file
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

export const useQueueData = (queueId) => {
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket } = useQueue(); // This line now works correctly

  useEffect(() => {
    if (!queueId) {
        setLoading(false);
        return;
    };

    const fetchQueue = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api/queues/${queueId}`);
        setQueue(response.data);
        setError(null);
      } catch (err) {
        setError('Queue not found.');
        setQueue(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();

    if (socket) {
      socket.emit('join-queue-room', queueId);
      socket.on('queue-updated', (updatedQueue) => {
        if(updatedQueue._id === queueId) {
          setQueue(updatedQueue);
        }
      });

      return () => {
        socket.emit('leave-queue-room', queueId);
        socket.off('queue-updated');
      };
    }
  }, [queueId, socket]);

  return { queue, loading, error };
};