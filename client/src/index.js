import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueueProvider } from './context/QueueContext';
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueueProvider>
      <App />
    </QueueProvider>
  </React.StrictMode>
);