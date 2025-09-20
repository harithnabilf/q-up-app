import { useContext } from 'react';
import { QueueContext } from '../context/QueueContext'; // Correctly imports the context

// The hook is created and exported here.
export const useQueue = () => {
  return useContext(QueueContext);
};