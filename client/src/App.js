import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SetupPage from './pages/SetupPage';
import ConfirmationPage from './pages/ConfirmationPage';
import AdminDashboard from './pages/AdminDashboard';
import JoinPage from './pages/JoinPage';
import VisitorPage from './pages/VisitorPage';

function App() {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={<SetupPage />} />
          <Route path="/:queueId/confirmation" element={<ConfirmationPage />} />
          <Route path="/admin/:queueId" element={<AdminDashboard />} />
          <Route path="/queue/:queueId" element={<JoinPage />} />
          <Route path="/queue/:queueId/ticket/:ticketNumber" element={<VisitorPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;